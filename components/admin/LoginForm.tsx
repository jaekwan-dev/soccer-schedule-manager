import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface LoginFormProps {
  password: string;
  setPassword: (pw: string) => void;
  onLogin: () => void;
}

export default function LoginForm({ password, setPassword, onLogin }: LoginFormProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xs">
        <div className="border-0 shadow-md bg-white rounded-xl">
          <div className="p-6 pb-0">
            <div className="text-center text-lg font-bold mb-2">관리자 로그인</div>
          </div>
          <div className="p-6 pt-2 space-y-4">
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-full"
              onKeyDown={e => { if (e.key === 'Enter') onLogin(); }}
            />
            <Button onClick={onLogin} className="w-full rounded-full">
              로그인
            </Button>
            <Separator />
            <div className="text-center">
              <Link href="/">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2 rounded-full">
                  <ArrowLeft className="h-4 w-4" />
                  메인으로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 