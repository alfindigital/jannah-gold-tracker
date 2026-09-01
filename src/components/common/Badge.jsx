import React from 'react';
import { STATUS, SCHEDULE_STATUS } from '../../db/db';

export default function Badge({ status, text }) {
  let badgeStyle = "bg-[#EDE8DE] text-[#5C5446] border-[#DDD5C5]";
  let label = text || status;

  switch (status) {
    case STATUS.READY:
      badgeStyle = "bg-[#EAF3EA] text-[#1E5C27] border-[#C2E0C7] font-bold shadow-xs";
      label = text || "Ready";
      break;
    case STATUS.BOOKED:
      badgeStyle = "bg-[#F3EBF9] text-[#5C278C] border-[#DDC7EF] font-bold shadow-xs";
      label = text || "Booked";
      break;
    case STATUS.SOLD:
      badgeStyle = "bg-[#EAE5DB] text-[#6B6355] border-[#DDD5C5] font-medium";
      label = text || "Sold";
      break;
    case SCHEDULE_STATUS.PENDING:
      // Luxury Warm Gold Badge for Wait
      badgeStyle = "bg-[#FBF1D8] text-[#7A5813] border-[#EAD092] font-extrabold shadow-xs";
      label = text || "Wait";
      break;
    case SCHEDULE_STATUS.ONGOING:
      badgeStyle = "bg-[#E8EFF8] text-[#1D4E89] border-[#BDD3EC] font-bold shadow-xs";
      label = text || "Process";
      break;
    case SCHEDULE_STATUS.COMPLETED:
      badgeStyle = "bg-[#1B1814] text-[#F3E5C8] border-[#C59A3F]/50 font-bold shadow-xs";
      label = text || "Done";
      break;
    case SCHEDULE_STATUS.CANCELLED:
      badgeStyle = "bg-[#FBEBEB] text-[#932525] border-[#F2C2C2] font-bold shadow-xs";
      label = text || "Cancel";
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wide border ${badgeStyle}`}>
      {label}
    </span>
  );
}
