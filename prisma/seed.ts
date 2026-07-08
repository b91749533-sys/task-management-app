import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let prisma: PrismaClient;

async function main() {
  console.log("DATABASE_URL in process.env:", process.env.DATABASE_URL);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  console.log("Seeding database...");

  // Clean up existing data in reverse relation order
  await prisma.activity.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Mock User
  const mockUser = await prisma.user.create({
    data: {
      id: "00000000-0000-0000-0000-000000000000",
      email: "demo@taskflow.com",
      name: "Demo User",
    },
  });

  // 2. Create Mock Categories
  const workCat = await prisma.category.create({
    data: {
      name: "Work",
      color: "#6366f1", // indigo
      userId: mockUser.id,
    },
  });

  const personalCat = await prisma.category.create({
    data: {
      name: "Personal",
      color: "#a855f7", // purple
      userId: mockUser.id,
    },
  });

  const urgentCat = await prisma.category.create({
    data: {
      name: "Urgent",
      color: "#ef4444", // red
      userId: mockUser.id,
    },
  });

  // 3. Create Mock Tasks
  await prisma.task.create({
    data: {
      title: "Complete TaskFlow dashboard",
      description: "Build the landing section, statistics cards, and task progress charts.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      labels: ["Development", "Next.js"],
      userId: mockUser.id,
      categoryId: workCat.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Implement database schema & seeds",
      description: "Write seed script and verify database connection via Prisma.",
      priority: "MEDIUM",
      status: "DONE",
      dueDate: new Date(),
      labels: ["Database"],
      userId: mockUser.id,
      categoryId: workCat.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Grocery shopping",
      description: "Buy milk, eggs, bread, and fruits.",
      priority: "LOW",
      status: "TODO",
      dueDate: new Date(Date.now() + 86400000 * 4), // 4 days from now
      labels: ["Shopping"],
      userId: mockUser.id,
      categoryId: personalCat.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
