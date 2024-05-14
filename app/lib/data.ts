import {
  CustomerField,
  CustomersTableType,
  InvoicesTable,
  LatestInvoice,
} from './definitions';

import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';
import prisma from './prisma';
import { status } from '@prisma/client';

export async function fetchRevenue() {
  // noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();

  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log('Data fetch completed after 3 seconds.');

    return prisma.revenue.findMany();

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }

}

export async function fetchLatestInvoices() {

  noStore();

  try {

    const invoices = await prisma.invoices.findMany({

      take: 5,

      orderBy: [
        {
          date: 'desc',
        }
      ],

      select: {
        id: true,
        amount: true,
        customer: {
          select: {
            name: true,
            image_url: true,
            email: true
          }
        }
      }

    });

    const latestInvoices: LatestInvoice[] = invoices.map((invoice) => ({
      id: invoice.id,
      name: invoice.customer.name,
      email: invoice.customer.email,
      image_url: invoice.customer.image_url,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {

  noStore();

  try {

    const numberOfInvoices = await prisma.invoices.count();
    const numberOfCustomers = await prisma.customers.count();
    const aggPaidInvoices = await prisma.invoices.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: status.PAID
      }
    });
    const totalPaidInvoices = formatCurrency(aggPaidInvoices._sum.amount || 0);
    const aggPendingInvoices = await prisma.invoices.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: status.PENDING
      }
    });
    const totalPendingInvoices = formatCurrency(aggPendingInvoices._sum.amount || 0);

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }

}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    return prisma.$queryRaw<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status::text ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await prisma.$queryRaw<{ total: BigInt }[]>`SELECT COUNT(*) total
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status::text ILIKE ${`%${query}%`}
  `;

    return Math.ceil(Number(count?.[0].total) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {

    return prisma.invoices.findUnique({
      where: {
        id: id
      }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {

    return prisma.customers.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: [
        {
          name: 'asc'
        }
      ]
    });
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

// export async function fetchFilteredCustomers(query: string) {
//   try {
//     const data = await sql<CustomersTableType>`
// 		SELECT
// 		  customers.id,
// 		  customers.name,
// 		  customers.email,
// 		  customers.image_url,
// 		  COUNT(invoices.id) AS total_invoices,
// 		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
// 		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
// 		FROM customers
// 		LEFT JOIN invoices ON customers.id = invoices.customer_id
// 		WHERE
// 		  customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`}
// 		GROUP BY customers.id, customers.name, customers.email, customers.image_url
// 		ORDER BY customers.name ASC
// 	  `;

//     const customers = data.rows.map((customer) => ({
//       ...customer,
//       total_pending: formatCurrency(customer.total_pending),
//       total_paid: formatCurrency(customer.total_paid),
//     }));

//     return customers;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch customer table.');
//   }
// }

// export async function getUser(email: string) {
//   try {
//     const user = await sql`SELECT * FROM users WHERE email=${email}`;
//     return user.rows[0] as User;
//   } catch (error) {
//     console.error('Failed to fetch user:', error);
//     throw new Error('Failed to fetch user.');
//   }
// }
