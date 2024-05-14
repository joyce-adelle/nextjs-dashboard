'use server';

import prisma from './prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['PENDING', 'PAID']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const { amount, customerId, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    // const date = new Date().toISOString().split('T')[0];

    await prisma.invoices.create({
        data: {
            amount: amountInCents,
            status: status,
            customerId: customerId,
            date: new Date()
        }
    }).catch(err => {
        console.error(err);
        throw new Error("Unable to create invoice");
    });

    //instead of using useEffect to update page with new invoice
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    await prisma.invoices.update({
        data: {
            customerId: customerId,
            amount: amountInCents,
            status: status
        },
        where: {
            id: id
        }
    }).catch(err => {
        console.error(err);
        throw new Error("Unable to update invoice");
    });

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

}