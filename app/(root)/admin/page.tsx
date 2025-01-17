"use client";

import React, { useEffect, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AppointmentParams } from "@/types/types";
import { Footer } from "@/components/shared/Footer";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getAllAppointments, getOwner } from "@/lib/action/appointment.actions";

const columnHelper = createColumnHelper<AppointmentParams>();

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
  columnHelper.accessor("budget", {
    header: "budget",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("subject", {
    header: "subject",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("email", {
    header: "email",
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

  const [data, setData] = useState<AppointmentParams[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        router.push("/sign-in");
        return;
      }
      const ownerId = await getOwner();
      if (userId !== ownerId) {
        router.push("/");
        return;
      }

      try {
        const response = await getAllAppointments();

        setData(response.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        router.push("/");
      }
    };

    fetchData();
  }, [userId, router]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-white font-bold text-xl">
        No appointments found
      </div>
    );
  }

  return (
    <div className="w-full min-h-[100vh] flex flex-col justify-between items-center">
      <div className="max-w-7xl w-full p-2 data-table mt-4 md:mt-11 no-scrollbar">
        <table className="shad-table w-full">
          <thead className="bg-gray-300 text-center">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="shad-table-row-header text-center"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
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
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="shad-table-row text-center">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
};

export default AppointmentTable;
