"use client";

import React, { useEffect, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Footer } from "@/components/shared/Footer";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getAllAppointments, getOwner } from "@/lib/action/appointment.actions";
import { BreadcrumbsDefault } from "@/components/shared/breadcrumbs";
import { MyAppointmentParams } from "@/types/types";

const columnHelper = createColumnHelper<MyAppointmentParams>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("address", {
    header: "Address",
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor("subject", {
    header: "Subject",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("message", {
    header: "Message",
    cell: (info) => info.getValue() || "N/A",
  }),
];

const AppointmentTable = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<MyAppointmentParams[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        router.push("/sign-in");
        return;
      }

      try {
        const ownerId = await getOwner();
        if (userId !== ownerId) {
          router.push("/");
          return;
        }

        const response = await getAllAppointments();
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, router]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white font-bold text-xl bg-black">
        Loading appointments...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-5">
        <BreadcrumbsDefault />
        <div className="max-w-4xl w-full bg-gray-900/50 backdrop-blur-md border border-[#B026FF]/30 rounded-xl p-12 text-center mt-12">
          <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
            No Appointments Found
          </h2>
          <p className="text-gray-300 text-xl">
            There are currently no scheduled appointments.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-between items-center bg-black">
      <BreadcrumbsDefault />

      <div className="max-w-7xl w-full p-4 mt-8">
        <div className="bg-gray-900/50 backdrop-blur-md border border-[#B026FF]/30 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="bg-gradient-to-r from-[#00F0FF]/20 to-[#FF2E9F]/20"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="py-4 px-4 text-left text-sm font-bold text-white uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-[#B026FF]/30">
                {table.getRowModel().rows.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={
                      rowIndex % 2 === 0 ? "bg-gray-900/30" : "bg-gray-800/30"
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="py-4 px-4 text-sm text-gray-300"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AppointmentTable;
