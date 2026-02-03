"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

interface Props {
  startDate?: Date;
  endDate?: Date;
  clientName: string;
  onStartDateChange: (d?: Date) => void;
  onEndDateChange: (d?: Date) => void;
  onClientNameChange: (v: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export default function SalesFilters(props: Props) {
  return (
    <div className="bg-card border rounded-xl p-4 flex flex-wrap gap-3 items-end">
      {(["Start Date", "End Date"] as const).map((label, idx) => {
        const date = idx === 0 ? props.startDate : props.endDate;
        const onChange =
          idx === 0 ? props.onStartDateChange : props.onEndDateChange;

        return (
          <div key={label}>
            <p className="text-xs mb-1 text-muted-foreground">{label}</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[160px] justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "yyyy-MM-dd") : "Select"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar mode="single" selected={date} onSelect={onChange} disabled={props.startDate ? { before: props.startDate } : undefined}/>
              </PopoverContent>
            </Popover>
          </div>
        );
      })}

      <div>
        <p className="text-xs mb-1 text-muted-foreground">Client</p>
        <Input
          className="w-[180px]"
          placeholder="Meesho, Nykaa..."
          value={props.clientName}
          onChange={(e) => props.onClientNameChange(e.target.value)}
        />
      </div>

      <Button onClick={props.onSubmit}>Apply</Button>

      <Button
        variant="ghost"
        onClick={props.onClear}
        className="text-muted-foreground"
      >
        <X className="h-4 w-4 mr-1" /> Clear
      </Button>
    </div>
  );
}
