const {
  invoices,
  customers,
  revenue,
  users,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { uuidv7 } = require('uuidv7');

const prisma = new PrismaClient()

async function seedUsers(prisma) {

  try {

    // Insert data into the "users" table
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return prisma.$executeRaw`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);

    return {
      users: insertedUsers,
    };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedInvoices(prisma) {

  try {

    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    const insertedInvoices = await Promise.all(
      invoices.map(
        (invoice) =>
          prisma.$executeRaw`
        INSERT INTO invoices (id, customer_id, amount, status, date)
        VALUES (${uuidv7()}, ${invoice.customer_id}, ${invoice.amount}, ${invoice.status.toUpperCase()}::status, ${invoice.date}::date)
        ON CONFLICT (id) DO NOTHING;
      `),
    );

    console.log(`Seeded ${insertedInvoices.length} invoices`);

    return {
      invoices: insertedInvoices,
    };
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error;
  }
}

async function seedCustomers(prisma) {

  try {

    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Insert data into the "customers" table
    const insertedCustomers = await Promise.all(
      customers.map(
        (customer) => prisma.$executeRaw`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${insertedCustomers.length} customers`);

    return {
      customers: insertedCustomers,
    };
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}

async function seedRevenue(prisma) {

  try {

    // Insert data into the "revenue" table
    const insertedRevenue = await Promise.all(
      revenue.map(
        (rev) => prisma.$executeRaw`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${insertedRevenue.length} revenue`);

    return {
      revenue: insertedRevenue,
    };

  } catch (error) {
    console.error('Error seeding revenue:', error);
    throw error;
  }
}

async function main() {

  await seedUsers(prisma);
  await seedCustomers(prisma);
  await seedInvoices(prisma);
  await seedRevenue(prisma);

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });
