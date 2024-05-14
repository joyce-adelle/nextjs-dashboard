import CustomersTable from '@/app/ui/customers/table';
import { CustomersTableSkeleton } from '@/app/ui/skeletons';
import Search from '@/app/ui/search';
import { Suspense } from 'react';
import { lusitana } from '@/app/ui/fonts';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query ?? '';
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search customers..." />
      </div>
      <Suspense key={query + currentPage} fallback={<CustomersTableSkeleton />}>
        <CustomersTable query={query} />
      </Suspense>
    </div>
  );
}
