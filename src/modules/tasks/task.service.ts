import { prisma } from "../../core/database/prisma";
import { AppError } from "../../core/errors/AppError";
import {
  TaskPriority,
  TaskStatus,
  TaskType,
  UserRole,
  TaskActivityType,
} from "@prisma/client";

type CreateTaskInput = {
  title?: string;
  description?: string;
  type?: TaskType;

  natureOfWorkId?: string;
  natureOfWorkName?: string;

  priority: TaskPriority;
  assignedToId: string;
  scheduledDate: string;

  customer: {
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    designation?: string;
    department?: string;
    address?: string;
  };
};
type UpdateTaskInput = {
  assignedToId?: string | null;

  customerId?: string | null;

  customer?: {
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    designation?: string;
    department?: string;
    address?: string;
  };

  natureOfWorkId?: string | null;
  natureOfWorkName?: string;

  type?: TaskType | null;
  title?: string | null;
  description?: string | null;

  priority?: TaskPriority;

  scheduledDate?: string;
};

export class TaskService {
  // ------------------------------------------
  // GET ALL TASKS
  // ------------------------------------------

  async getTasks(
    companyId: string,
    userId: string,
    role: UserRole
  ) {
    const where: any = {
      companyId,
    };

    // Sales / Technician only see their own tasks
    if (
      role === UserRole.SALES ||
      role === UserRole.TECHNICIAN
    ) {
      where.assignedToId = userId;
    }

    return prisma.task.findMany({
      where,

      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        customer: {
          select: {
            id: true,
            name: true,
            contactName: true,
            phone: true,
            address: true,
          },
        },

      natureOfWork: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
        _count: {
          select: {
            comments: true,
            attachments: true,
            activities: true,
          },
        },
      },

      orderBy: {
        scheduledDate: "asc",
      },
    });
  }

  // ------------------------------------------
  // GET TASK BY ID
  // ------------------------------------------

  async getTask(
    companyId: string,
    taskId: string,
    userId: string,
    role: UserRole
  ) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        companyId,
      },

      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        customer: true,
        natureOfWork: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },

            attachments: true,
          },

          orderBy: {
            capturedAt: "asc",
          },
        },

        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },

          orderBy: {
            createdAt: "asc",
          },
        },

        attachments: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!task) {
      throw new AppError(
        "Task not found",
        404
      );
    }

    // Sales / Technician can only access assigned tasks
    if (
      role !== UserRole.ADMIN &&
      task.assignedToId !== userId
    ) {
      throw new AppError(
        "Access denied",
        403
      );
    }

    return task;
  }

// ------------------------------------------
// CREATE TASK
// ------------------------------------------

async createTask(
  companyId: string,
  createdById: string,
  input: CreateTaskInput
) {
  if (!input.customer?.name?.trim()) {
    throw new AppError(
      "Customer name is required",
      400
    );
  }

  const task = await prisma.$transaction(
    async (tx) => {

      // ------------------------------------------
      // FIND / CREATE CUSTOMER
      // ------------------------------------------

      let customer =
        await tx.customer.findFirst({
          where: {
            companyId,
            name: {
              equals:
                input.customer.name.trim(),
              mode: "insensitive",
            },
          },
        });

      if (!customer) {
        customer =
          await tx.customer.create({
            data: {
              companyId,
              name:
                input.customer.name.trim(),

              contactName:
                input.customer.contactName
                  ?.trim() || null,

              phone:
                input.customer.phone
                  ?.trim() || null,

              email:
                input.customer.email
                  ?.trim() || null,

              address:
                input.customer.address
                  ?.trim() || null,

              designation:
                input.customer.designation
                  ?.trim() || null,

              department:
                input.customer.department
                  ?.trim() || null,
            },
          });
      }

      // ------------------------------------------
      // FIND / CREATE NATURE OF WORK
      // ------------------------------------------

      let natureOfWorkId =
        input.natureOfWorkId || null;

      // If user typed a new Nature of Work
      if (
        !natureOfWorkId &&
        input.natureOfWorkName?.trim()
      ) {
        const name =
          input.natureOfWorkName.trim();

        // Check if it already exists
        const existingNatureOfWork =
          await tx.natureOfWork.findFirst({
            where: {
              companyId,
              name: {
                equals: name,
                mode: "insensitive",
              },
              isActive: true,
            },
          });

        if (existingNatureOfWork) {
          // Reuse existing Nature of Work
          natureOfWorkId =
            existingNatureOfWork.id;
        } else {
          // Create new Nature of Work
          const newNatureOfWork =
            await tx.natureOfWork.create({
              data: {
                companyId,
                name,

                role:
                  input.type ===
                  "TECHNICIAN_VISIT"
                    ? UserRole.TECHNICIAN
                    : UserRole.SALES,
              },
            });

          natureOfWorkId =
            newNatureOfWork.id;
        }
      }

      // ------------------------------------------
      // VALIDATE EXISTING NATURE OF WORK
      // ------------------------------------------

      if (
        input.natureOfWorkId &&
        !input.natureOfWorkName
      ) {
        const natureOfWork =
          await tx.natureOfWork.findFirst({
            where: {
              id: input.natureOfWorkId,
              companyId,
              isActive: true,
            },
          });

        if (!natureOfWork) {
          throw new AppError(
            "Nature of work not found or inactive",
            400
          );
        }
      }

      // ------------------------------------------
      // CREATE TASK
      // ------------------------------------------

      return tx.task.create({
        data: {
          companyId,
          createdById,

          assignedToId:
            input.assignedToId,

          customerId:
            customer.id,

          // IMPORTANT:
          // Use the calculated ID, not input.natureOfWorkId
          natureOfWorkId,

          title:
            input.title?.trim() || null,

          description:
            input.description?.trim() || null,

          type:
            input.type || null,

          priority:
            input.priority,

          scheduledDate:
            new Date(input.scheduledDate),
        },

        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },

          customer: {
            select: {
              id: true,
              name: true,
              contactName: true,
              phone: true,
              email: true,
              address: true,
              designation: true,
              department: true,
            },
          },

          natureOfWork: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });
    }
  );

  return task;
}
// ------------------------------------------
// UPDATE TASK
// ------------------------------------------

async updateTask(
  companyId: string,
  userId: string,
  role: UserRole,
  taskId: string,
  input: UpdateTaskInput
) {
  // ------------------------------------------
  // FIND EXISTING TASK
  // ------------------------------------------

  const existing =
    await prisma.task.findFirst({
      where: {
        id: taskId,
        companyId,
      },
    });

  if (!existing) {
    throw new AppError(
      "Task not found",
      404
    );
  }

  return prisma.$transaction(
    async (tx) => {

      // ------------------------------------------
      // VALIDATE ASSIGNED USER
      // ------------------------------------------

      if (
        input.assignedToId !== undefined &&
        input.assignedToId !== null
      ) {
        const assignedUser =
          await tx.user.findFirst({
            where: {
              id: input.assignedToId,
              companyId,
              status: "ACTIVE",
            },
          });

        if (!assignedUser) {
          throw new AppError(
            "Assigned user not found or inactive",
            400
          );
        }

        const assigningToSelf =
          assignedUser.id === userId;

        const isValidNormalAssignee =
          assignedUser.role ===
            UserRole.SALES ||
          assignedUser.role ===
            UserRole.TECHNICIAN;

        if (
          !isValidNormalAssignee &&
          !(
            role === UserRole.ADMIN &&
            assigningToSelf
          )
        ) {
          throw new AppError(
            "Tasks can only be assigned to Sales, Technician, or Admin self",
            400
          );
        }
      }

      // ------------------------------------------
      // VALIDATE EXISTING CUSTOMER
      // ------------------------------------------

      if (
        input.customerId !== undefined &&
        input.customerId !== null
      ) {
        const customer =
          await tx.customer.findFirst({
            where: {
              id: input.customerId,
              companyId,
            },
          });

        if (!customer) {
          throw new AppError(
            "Customer not found",
            404
          );
        }
      }

      // ------------------------------------------
      // CUSTOMER
      // Existing customer OR create new customer
      // ------------------------------------------

      let customerId =
        input.customerId !== undefined
          ? input.customerId
          : existing.customerId;

      if (input.customer?.name?.trim()) {

        const customerName =
          input.customer.name.trim();

        // Find existing customer
        let customer =
          await tx.customer.findFirst({
            where: {
              companyId,
              name: {
                equals: customerName,
                mode: "insensitive",
              },
            },
          });

        // Create if not found
        if (!customer) {
          customer =
            await tx.customer.create({
              data: {
                companyId,
                name: customerName,

                contactName:
                  input.customer.contactName
                    ?.trim() || null,

                phone:
                  input.customer.phone
                    ?.trim() || null,

                email:
                  input.customer.email
                    ?.trim() || null,

                designation:
                  input.customer.designation
                    ?.trim() || null,

                department:
                  input.customer.department
                    ?.trim() || null,

                address:
                  input.customer.address
                    ?.trim() || null,
              },
            });
        }

        customerId = customer.id;
      }

      // ------------------------------------------
      // NATURE OF WORK
      // ------------------------------------------

      let natureOfWorkId =
        input.natureOfWorkId !== undefined
          ? input.natureOfWorkId
          : existing.natureOfWorkId;

      // If user entered a new Nature of Work
      if (
        !natureOfWorkId &&
        input.natureOfWorkName?.trim()
      ) {
        const name =
          input.natureOfWorkName.trim();

        // Check existing
        const existingNatureOfWork =
          await tx.natureOfWork.findFirst({
            where: {
              companyId,
              name: {
                equals: name,
                mode: "insensitive",
              },
              isActive: true,
            },
          });

        if (existingNatureOfWork) {
          natureOfWorkId =
            existingNatureOfWork.id;
        } else {
          // Create new
          const newNatureOfWork =
            await tx.natureOfWork.create({
              data: {
                companyId,
                name,

                role:
                  input.type ===
                  "TECHNICIAN_VISIT"
                    ? UserRole.TECHNICIAN
                    : UserRole.SALES,
              },
            });

          natureOfWorkId =
            newNatureOfWork.id;
        }
      }

      // ------------------------------------------
      // VALIDATE EXISTING NATURE OF WORK
      // ------------------------------------------

      if (
        input.natureOfWorkId !== undefined &&
        input.natureOfWorkId !== null
      ) {
        const natureOfWork =
          await tx.natureOfWork.findFirst({
            where: {
              id: input.natureOfWorkId,
              companyId,
              isActive: true,
            },
          });

        if (!natureOfWork) {
          throw new AppError(
            "Nature of work not found or inactive",
            400
          );
        }
      }

      // ------------------------------------------
      // UPDATE TASK
      // ------------------------------------------

      return tx.task.update({
        where: {
          id: taskId,
        },

        data: {
          // Assignee
          ...(input.assignedToId !==
            undefined && {
            assignedToId:
              input.assignedToId,
          }),

          // Customer
          ...(customerId !==
            existing.customerId && {
            customerId,
          }),

          // Nature of Work
          ...(natureOfWorkId !==
            existing.natureOfWorkId && {
            natureOfWorkId,
          }),

          // Type
          ...(input.type !== undefined && {
            type: input.type,
          }),

          // Title
          ...(input.title !== undefined && {
            title:
              input.title?.trim() || null,
          }),

          // Description
          ...(input.description !==
            undefined && {
            description:
              input.description?.trim() ||
              null,
          }),

          // Priority
          ...(input.priority !== undefined && {
            priority: input.priority,
          }),

          // Scheduled date/time
          ...(input.scheduledDate !==
            undefined && {
            scheduledDate: new Date(
              input.scheduledDate
            ),
          }),
        },

        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
            },
          },

          customer: {
            select: {
              id: true,
              name: true,
              contactName: true,
              phone: true,
              email: true,
              designation: true,
              department: true,
              address: true,
            },
          },

          natureOfWork: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });
    }
  );
}

  // ------------------------------------------
  // UPDATE STATUS
  // ------------------------------------------

  async updateStatus(
    companyId: string,
    taskId: string,
    status: TaskStatus,
    rejectionReason?: string
  ) {

    let natureOfWorkId = input.natureOfWorkId;

if (natureOfWorkId) {
  const natureOfWork =
    await prisma.natureOfWork.findFirst({
      where: {
        id: natureOfWorkId,
        companyId,
        isActive: true,
      },
    });

  if (!natureOfWork) {
    throw new AppError(
      "Nature of work not found or inactive",
      400
    );
  }
}

if (
  !natureOfWorkId &&
  input.natureOfWorkName?.trim()
) {
  const name =
    input.natureOfWorkName.trim();

  const existingNatureOfWork =
    await prisma.natureOfWork.findFirst({
      where: {
        companyId,
        name,
        isActive: true,
      },
    });

  if (existingNatureOfWork) {
    natureOfWorkId =
      existingNatureOfWork.id;
  } else {
    const newNatureOfWork =
      await prisma.natureOfWork.create({
        data: {
          companyId,
          name,
          role:
            input.type === "TECHNICIAN_VISIT"
              ? UserRole.TECHNICIAN
              : UserRole.SALES,
        },
      });

    natureOfWorkId =
      newNatureOfWork.id;
  }
}
    const task =
      await prisma.task.findFirst({
        where: {
          id: taskId,
          companyId,
        },
      });

    if (!task) {
      throw new AppError(
        "Task not found",
        404
      );
    }

    if (
      status === TaskStatus.REJECTED &&
      !rejectionReason?.trim()
    ) {
      throw new AppError(
        "Rejection reason is required",
        400
      );
    }

    return prisma.task.update({
      where: {
        id: taskId,
      },

      data: {
        status,

        rejectionReason:
          status === TaskStatus.REJECTED
            ? rejectionReason
            : null,
      },
    });
  }

  // ------------------------------------------
  // DELETE TASK
  // ------------------------------------------

  async deleteTask(
    companyId: string,
    taskId: string
  ) {
    const task =
      await prisma.task.findFirst({
        where: {
          id: taskId,
          companyId,
        },
      });

    if (!task) {
      throw new AppError(
        "Task not found",
        404
      );
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return {
      message: "Task deleted successfully",
    };
  }

  async getTaskActivities(
  companyId: string,
  taskId: string,
  userId: string,
  role: UserRole
) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      companyId,
    },
    select: {
      id: true,
      assignedToId: true,
    },
  });

  if (!task) {
    throw new AppError(
      "Task not found",
      404
    );
  }

  // Non-admin users can only access
  // activities of tasks assigned to them.
  if (
    role !== UserRole.ADMIN &&
    task.assignedToId !== userId
  ) {
    throw new AppError(
      "Access denied",
      403
    );
  }

  return prisma.taskActivity.findMany({
    where: {
      taskId,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },

    orderBy: {
      capturedAt: "asc",
    },
  });
}

async createTaskActivity(
  companyId: string,
  taskId: string,
  userId: string,
  role: UserRole,
  data: {
    type: TaskActivityType;
    latitude?: number;
    longitude?: number;
    capturedAt?: string | Date;
    notes?: string;
  }
) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      companyId,
    },

    select: {
      id: true,
      assignedToId: true,
      status: true,
    },
  });

  if (!task) {
    throw new AppError(
      "Task not found",
      404
    );
  }

  if (
    role !== UserRole.ADMIN &&
    task.assignedToId !== userId
  ) {
    throw new AppError(
      "Access denied",
      403
    );
  }

  const activity =
    await prisma.taskActivity.create({
      data: {
        taskId,
        userId,
        type: data.type,

        latitude:
          data.latitude ?? null,

        longitude:
          data.longitude ?? null,

        capturedAt: data.capturedAt
          ? new Date(data.capturedAt)
          : new Date(),

        notes:
          data.notes || null,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

  return activity;
}
async addActivityPhotos(
  companyId: string,
  userId: string,
  taskId: string,
  activityId: string,
  role:UserRole,
  files: Express.Multer.File[]
) {
  const task =
    await prisma.task.findFirst({
      where: {
        id: taskId,
        companyId,
      },
    });

  if (!task) {
    throw new AppError(
      "Task not found",
      404
    );
  }

if (
  role !== UserRole.ADMIN &&
  task.assignedToId !== userId
) {
  throw new AppError(
    "Access denied",
    403
  );
}

  const activity =
    await prisma.taskActivity.findFirst({
      where: {
        id: activityId,
        taskId,
      },
    });

  if (!activity) {
    throw new AppError(
      "Activity not found",
      404
    );
  }

  const attachments =
    await prisma.taskActivityAttachment.createMany({
      data: files.map((file) => ({
        activityId,

        fileName:
          file.originalname,

        fileUrl:
          `/uploads/task-activities/${file.filename}`,

        fileType:
          file.mimetype,

        fileSize:
          file.size,
      })),
    });

  return prisma.taskActivity.findUnique({
    where: {
      id: activityId,
    },
    include: {
      attachments: true,
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });
}
async updateTaskActivity(
  companyId: string,
  userId: string,
  role: UserRole,
  taskId: string,
  activityId: string,
  data: {
    type?: TaskActivityType;
    notes?: string;
    latitude?: number | null;
    longitude?: number | null;
    accuracy?: number | null;
    capturedAt?: string | Date;
  }
) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      companyId,
    },
    select: {
      id: true,
      assignedToId: true,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // Admin can edit any activity.
  // Non-admin users can edit only their assigned task.
  if (
    role !== UserRole.ADMIN &&
    task.assignedToId !== userId
  ) {
    throw new AppError("Access denied", 403);
  }

  const activity =
    await prisma.taskActivity.findFirst({
      where: {
        id: activityId,
        taskId,
      },
    });

  if (!activity) {
    throw new AppError(
      "Activity not found",
      404
    );
  }

  const updated =
    await prisma.taskActivity.update({
      where: {
        id: activityId,
      },
      data: {
        ...(data.type !== undefined && {
          type: data.type,
        }),

        ...(data.notes !== undefined && {
          notes: data.notes,
        }),

        ...(data.latitude !== undefined && {
          latitude: data.latitude,
        }),

        ...(data.longitude !== undefined && {
          longitude: data.longitude,
        }),

        ...(data.capturedAt !== undefined && {
          capturedAt: new Date(data.capturedAt),
        }),
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },

        attachments: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  return updated;
}

async deleteTaskActivity(
  companyId: string,
  userId: string,
  role: UserRole,
  taskId: string,
  activityId: string
) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      companyId,
    },
    select: {
      id: true,
      assignedToId: true,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (
    role !== UserRole.ADMIN &&
    task.assignedToId !== userId
  ) {
    throw new AppError("Access denied", 403);
  }

  const activity =
    await prisma.taskActivity.findFirst({
      where: {
        id: activityId,
        taskId,
      },
    });

  if (!activity) {
    throw new AppError(
      "Activity not found",
      404
    );
  }

  await prisma.taskActivity.delete({
    where: {
      id: activityId,
    },
  });

  return {
    message: "Activity deleted successfully",
  };
}

async deleteActivityPhoto(
  companyId: string,
  userId: string,
  role: UserRole,
  taskId: string,
  activityId: string,
  photoId: string
) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      companyId,
    },
    select: {
      id: true,
      assignedToId: true,
    },
  });

  if (!task) {
    throw new AppError(
      "Task not found",
      404
    );
  }

  if (
    role !== UserRole.ADMIN &&
    task.assignedToId !== userId
  ) {
    throw new AppError(
      "Access denied",
      403
    );
  }

  const photo =
    await prisma.taskActivityAttachment.findFirst({
      where: {
        id: photoId,
        activityId,
      },
    });

  if (!photo) {
    throw new AppError(
      "Photo not found",
      404
    );
  }

  await prisma.taskActivityAttachment.delete({
    where: {
      id: photoId,
    },
  });

  return {
    id: photoId,
  };
}

// ------------------------------------------
// GET CUSTOMERS FOR TASK
// ------------------------------------------

async getTaskCustomers(
  companyId: string
) {
  return prisma.customer.findMany({
    where: {
      companyId,
    },
    select: {
      id: true,
      name: true,
      contactName: true,
      phone: true,
      email: true,
      designation: true,
      department: true,
      address: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}


// ------------------------------------------
// GET NATURE OF WORK FOR TASK
// ------------------------------------------

async getTaskNatureOfWork(
  companyId: string
) {
  return prisma.natureOfWork.findMany({
    where: {
      companyId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}


}

