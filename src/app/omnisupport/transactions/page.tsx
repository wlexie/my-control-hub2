
import Transactions from "../components/Transctions";

import SideNav from "../components/SideNav";

export default function TransactionsPage() {
    return (
      <div className="flex">
        <span className="w-[400px]">
        <SideNav />

        </span>

               
        <Transactions />
      </div>
    );
  }