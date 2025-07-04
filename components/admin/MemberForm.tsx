import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Edit } from "lucide-react";
import React from "react";


interface MemberFormProps {
  memberFormData: { name: string; level: number };
  setMemberFormData: (data: { name: string; level: number }) => void;
  isEditing: boolean;
  handleMemberSubmit: (e: React.FormEvent) => void;
  resetMemberForm: () => void;
}

export default function MemberForm({
  memberFormData,
  setMemberFormData,
  isEditing,
  handleMemberSubmit,
  resetMemberForm,
}: MemberFormProps) {
  // 레벨 옵션 (높은 레벨부터)
  const levelOptions = [
    { value: 13, name: "프로 1" },
    { value: 12, name: "세미프로 3" },
    { value: 11, name: "세미프로 2" },
    { value: 10, name: "세미프로 1" },
    { value: 9, name: "아마추어 5" },
    { value: 8, name: "아마추어 4" },
    { value: 7, name: "아마추어 3" },
    { value: 6, name: "아마추어 2" },
    { value: 5, name: "아마추어 1" },
    { value: 4, name: "비기너 3" },
    { value: 3, name: "비기너 2" },
    { value: 2, name: "비기너 1" },
    { value: 1, name: "루키 1" },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {isEditing ? (
            <>
              <Edit className="h-4 w-4" />팀원 수정
            </>
          ) : (
            <>
              <Users className="h-4 w-4" />새 팀원 등록
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleMemberSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="memberName" className="flex items-center gap-1 text-sm">
              <Users className="h-3 w-3" />이름
            </Label>
            <Input
              id="memberName"
              value={memberFormData.name}
              onChange={e => setMemberFormData({ ...memberFormData, name: e.target.value })}
              placeholder="팀원 이름"
              required
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="memberLevel" className="flex items-center gap-1 text-sm">
              <Users className="h-3 w-3" />레벨
            </Label>
            <select
              id="memberLevel"
              value={memberFormData.level}
              onChange={e => setMemberFormData({ ...memberFormData, level: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              required
            >
              {levelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 rounded-full text-sm py-2">
              {isEditing ? "수정하기" : "등록하기"}
            </Button>
            {isEditing && (
              <Button type="button" variant="outline" onClick={resetMemberForm} className="rounded-full text-sm py-2">
                취소
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 