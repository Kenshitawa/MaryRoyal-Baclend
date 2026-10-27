import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { canInScope, canManageStaffTarget, canDeleteStaffAccount, canViewStaffStatutory, canEditStaffStatutory } from "@/lib/permissions";
import { readSession } from "@/lib/session";

async function actor() {
  const token = (await cookies()).get("mary_session")?.value;
  const session = token ? await readSession(token) : null;
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, role: true, suspended: true, forcePasswordChange: true },
  });
  return user && !user.suspended && !user.forcePasswordChange ? user : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await actor();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await params;

  // Teachers see only their own profile
  if (user.id !== id && !canInScope(user.role, "staff", "view", "school")) {
    await db.auditEvent.create({
      data: { actorId: user.id, action: "ACCESS_DENIED", entity: "StaffProfile", entityId: id },
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const staff = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      suspended: true,
      staffNumber: true,
      tscNumber: true,
      employmentTitle: true,
      qualifications: true,
      createdAt: true,
      staffProfile: {
        include: {
          emergencyContacts: true,
          referees: true,
          documents: {
            select: {
              id: true,
              category: true,
              originalName: true,
              contentType: true,
              sizeBytes: true,
              createdAt: true,
            },
          },
          editHistory: {
            include: {
              actor: {
                select: { name: true, role: true },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 30,
          },
        },
      },
      assignments: {
        select: { grade: true, subject: true },
        orderBy: [{ grade: "asc" }, { subject: "asc" }],
      },
      classTeacherAssignments: {
        select: { grade: true },
      },
    },
  });

  if (!staff || staff.role === Role.PARENT || staff.role === Role.LEARNER) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }

  const canSeeStatutory = canViewStaffStatutory(user.role);

  if (canSeeStatutory) {
    await db.auditEvent.create({
      data: {
        actorId: user.id,
        action: "STAFF_STATUTORY_VIEWED",
        entity: "StaffProfile",
        entityId: id,
      },
    });
  }

  // Strip restricted statutory fields if not permitted
  let responseProfile = staff.staffProfile;
  if (responseProfile && !canSeeStatutory) {
    const {
      kraPin,
      nssfNumber,
      shaNumber,
      bankName,
      bankAccountName,
      bankAccountNumber,
      bankBranch,
      ...safeProfile
    } = responseProfile;
    responseProfile = safeProfile as any;
  }

  return NextResponse.json({
    staff: {
      ...staff,
      staffProfile: responseProfile,
      canEdit: canManageStaffTarget(user.role, staff.role),
      canDelete: canDeleteStaffAccount(user.role),
      canViewStatutory: canSeeStatutory,
      canEditStatutory: canEditStaffStatutory(user.role, staff.role),
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await actor();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const staff = await db.user.findUnique({
    where: { id },
    include: { staffProfile: true },
  });

  if (!staff || staff.role === Role.PARENT || staff.role === Role.LEARNER) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }

  // Permission check: Director can edit any; Head Teacher can edit permitted roles
  if (!canManageStaffTarget(user.role, staff.role)) {
    await db.auditEvent.create({
      data: { actorId: user.id, action: "ACCESS_DENIED", entity: "StaffUpdate", entityId: id },
    });
    return NextResponse.json(
      { error: "You are not authorized to edit this staff member's profile." },
      { status: 403 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const canEditStat = canEditStaffStatutory(user.role, staff.role);

  try {
    await db.$transaction(async (tx) => {
      // Track history changes
      const changes: { field: string; oldVal: string | null; newVal: string | null }[] = [];

      // Update User table fields if provided
      const userUpdates: any = {};
      if (body.name && body.name !== staff.name) {
        changes.push({ field: "name", oldVal: staff.name, newVal: body.name });
        userUpdates.name = body.name;
      }
      if (body.phone !== undefined && body.phone !== staff.phone) {
        changes.push({ field: "phone", oldVal: staff.phone, newVal: body.phone });
        userUpdates.phone = body.phone || null;
      }
      if (body.staffNumber !== undefined && body.staffNumber !== staff.staffNumber) {
        changes.push({ field: "staffNumber", oldVal: staff.staffNumber, newVal: body.staffNumber });
        userUpdates.staffNumber = body.staffNumber || null;
      }
      if (body.tscNumber !== undefined && body.tscNumber !== staff.tscNumber) {
        changes.push({ field: "tscNumber", oldVal: staff.tscNumber, newVal: body.tscNumber });
        userUpdates.tscNumber = body.tscNumber || null;
      }
      if (body.employmentTitle !== undefined && body.employmentTitle !== staff.employmentTitle) {
        changes.push({ field: "employmentTitle", oldVal: staff.employmentTitle, newVal: body.employmentTitle });
        userUpdates.employmentTitle = body.employmentTitle || null;
      }
      if (body.avatarUrl !== undefined && body.avatarUrl !== staff.avatarUrl) {
        userUpdates.avatarUrl = body.avatarUrl || null;
      }

      if (Object.keys(userUpdates).length > 0) {
        await tx.user.update({
          where: { id },
          data: userUpdates,
        });
      }

      // Upsert StaffProfile fields
      const currentProfile = staff.staffProfile;
      const profileUpdates: any = {};

      const profileFields = [
        "gender", "nationalId", "nationality", "maritalStatus", "alternatePhone",
        "residenceAddress", "county", "employmentType", "department", "lineManager",
        "educationHistory", "professionalQualifications", "certificates", "specializations",
        "yearsOfExperience", "previousEmployers"
      ];

      for (const field of profileFields) {
        if (body[field] !== undefined) {
          const oldV = currentProfile ? (currentProfile as any)[field] : null;
          const newV = body[field];
          if (String(oldV ?? "") !== String(newV ?? "")) {
            changes.push({ field, oldVal: oldV ? String(oldV) : null, newVal: newV ? String(newV) : null });
            profileUpdates[field] = newV || null;
          }
        }
      }

      if (body.dateOfBirth !== undefined) {
        profileUpdates.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
      }
      if (body.dateJoined !== undefined) {
        profileUpdates.dateJoined = body.dateJoined ? new Date(body.dateJoined) : null;
      }
      if (body.probationEndDate !== undefined) {
        profileUpdates.probationEndDate = body.probationEndDate ? new Date(body.probationEndDate) : null;
      }

      // Statutory fields (only if allowed to edit)
      if (canEditStat) {
        const statutoryFields = [
          "kraPin", "nssfNumber", "shaNumber", "bankName",
          "bankAccountName", "bankAccountNumber", "bankBranch"
        ];
        let statEdited = false;
        for (const sf of statutoryFields) {
          if (body[sf] !== undefined) {
            const oldV = currentProfile ? (currentProfile as any)[sf] : null;
            const newV = body[sf];
            if (String(oldV ?? "") !== String(newV ?? "")) {
              changes.push({ field: sf, oldVal: oldV ? String(oldV) : null, newVal: newV ? String(newV) : null });
              profileUpdates[sf] = newV || null;
              statEdited = true;
            }
          }
        }
        if (statEdited) {
          await tx.auditEvent.create({
            data: {
              actorId: user.id,
              action: "STAFF_STATUTORY_UPDATED",
              entity: "StaffProfile",
              entityId: id,
            },
          });
        }
      }

      const updatedProfile = await tx.staffProfile.upsert({
        where: { userId: id },
        create: {
          userId: id,
          ...profileUpdates,
        },
        update: profileUpdates,
      });

      // Emergency contacts update if provided
      if (Array.isArray(body.emergencyContacts)) {
        await tx.staffEmergencyContact.deleteMany({ where: { staffProfileId: updatedProfile.id } });
        for (const ec of body.emergencyContacts) {
          if (ec.fullName && ec.phone) {
            await tx.staffEmergencyContact.create({
              data: {
                staffProfileId: updatedProfile.id,
                fullName: ec.fullName,
                relationship: ec.relationship || "Contact",
                phone: ec.phone,
                isNextOfKin: Boolean(ec.isNextOfKin),
              },
            });
          }
        }
      }

      // Referees update if provided
      if (Array.isArray(body.referees)) {
        await tx.staffReferee.deleteMany({ where: { staffProfileId: updatedProfile.id } });
        for (const ref of body.referees) {
          if (ref.fullName && ref.organization && ref.phone) {
            await tx.staffReferee.create({
              data: {
                staffProfileId: updatedProfile.id,
                fullName: ref.fullName,
                organization: ref.organization,
                title: ref.title || null,
                phone: ref.phone,
                email: ref.email || null,
              },
            });
          }
        }
      }

      // Record edit history
      for (const change of changes) {
        await tx.staffHistory.create({
          data: {
            staffProfileId: updatedProfile.id,
            actorId: user.id,
            field: change.field,
            oldValue: change.oldVal,
            newValue: change.newVal,
          },
        });
      }

      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: "STAFF_PROFILE_UPDATED",
          entity: "StaffProfile",
          entityId: id,
        },
      });
    });

    return NextResponse.json({ success: true, message: "Staff profile updated successfully." });
  } catch (err: any) {
    console.error("Staff update error:", err);
    return NextResponse.json({ error: "Failed to update staff profile." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await actor();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  // Only DIRECTOR can delete staff accounts
  if (!canDeleteStaffAccount(user.role)) {
    await db.auditEvent.create({
      data: { actorId: user.id, action: "ACCESS_DENIED", entity: "StaffDelete" },
    });
    return NextResponse.json(
      { error: "Only the Director can delete staff accounts." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (id === user.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  const staff = await db.user.findUnique({
    where: { id },
  });
  if (!staff) {
    return NextResponse.json({ error: "Staff member not found." }, { status: 404 });
  }

  try {
    await db.$transaction(async (tx) => {
      // Soft archive or delete
      await tx.user.delete({ where: { id } });
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: "STAFF_ACCOUNT_DELETED",
          entity: "User",
          entityId: id,
        },
      });
    });

    return NextResponse.json({ success: true, message: "Staff account deleted successfully." });
  } catch (err: any) {
    console.error("Staff delete error:", err);
    return NextResponse.json({ error: "Failed to delete staff account." }, { status: 500 });
  }
}
