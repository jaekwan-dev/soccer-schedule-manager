import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onLogout: () => void;
}

export default function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-100 px-5 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-gray-900">관리자</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="destructive" size="sm" className="px-2 py-1" onClick={onLogout}>
              로그아웃
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 