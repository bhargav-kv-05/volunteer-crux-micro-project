"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

const volunteers = [
  { id: 1, name: "Sarah Johnson", role: "Team Leader", status: "Confirmed" },
  { id: 2, name: "Michael Chen", role: "Volunteer", status: "Pending" },
  { id: 3, name: "Emily Rodriguez", role: "Volunteer", status: "Confirmed" },
  { id: 4, name: "David Kim", role: "Coordinator", status: "Confirmed" },
  { id: 5, name: "Lisa Anderson", role: "Volunteer", status: "Confirmed" },
]

export function NgoView() {
  const [attendance, setAttendance] = useState<Record<number, boolean>>({})

  const toggleAttendance = (id: number) => {
    setAttendance((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Event Management</h2>
      <div className="rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Volunteer Name</TableHead>
              <TableHead className="font-semibold text-gray-900">Role</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Mark Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {volunteers.map((volunteer) => (
              <TableRow key={volunteer.id}>
                <TableCell className="font-medium text-gray-900">{volunteer.name}</TableCell>
                <TableCell className="text-gray-700">{volunteer.role}</TableCell>
                <TableCell>
                  <Badge
                    variant={volunteer.status === "Confirmed" ? "default" : "secondary"}
                    className={volunteer.status === "Confirmed" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}
                  >
                    {volunteer.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={attendance[volunteer.id] || false}
                    onCheckedChange={() => toggleAttendance(volunteer.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
