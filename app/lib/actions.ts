'use server';

import { AuthError } from 'next-auth';
import prisma from './prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { signIn } from '@/auth';
import { z } from 'zod';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['PENDING', 'PAID'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {

    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

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

export async function updateInvoice(id: string, prevState: State, formData: FormData) {

    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
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

export async function deleteInvoice(id: string) {

    await prisma.invoices.delete({
        where: {
            id: id
        }
    }).catch(err => {
        console.error(err);
        throw new Error("Unable to delete invoice");
    });

    revalidatePath('/dashboard/invoices');

}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}