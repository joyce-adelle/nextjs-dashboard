// This file contains type definitions for the data.

import { Prisma } from "@prisma/client";

export type User = Prisma.userGetPayload<{}>;
export type Revenue = Prisma.revenueGetPayload<{}>;
export type Customer = Prisma.customersGetPayload<{}>;
export type Invoice = Prisma.invoicesGetPayload<{}>;

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'PENDING' | 'PAID';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = Prisma.customersGetPayload<{
  select: {
    id: true,
    name: true
  }
}>;

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};
