import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import React from "react";
import {
  getLevelName,
  getLevelIcon,
  getLevelColor,
  getCategoryName,
  getCategoryIcon,
  getCategoryColor
} from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  level: number;
  createdAt: string;
  updatedAt: string;
}

interface MemberListProps {
  members: Member[];
  handleMemberEdit: (member: Member) => void;
  handleMemberDelete: (id: string) => void;
}

export default function MemberList({
  members,
  handleMemberEdit,
  handleMemberDelete,
}: MemberListProps) {
  // 카테고리별 그룹화
  const groupedMembers = members.reduce((groups: Record<string, Member[]>, member) => {
    const category = getCategoryName(member.level);
    if (!groups[category]) groups[category] = [];
    groups[category].push(member);
    return groups;
  }, {});
  // 카테고리 순서대로 정렬
  const categoryOrder = ["프로", "세미프로", "아마추어", "비기너", "루키"];
  const sortedCategories = categoryOrder.filter(category => groupedMembers[category]);

  return (
    <div className="space-y-6">
      {sortedCategories.map(category => {
        const categoryMembers = groupedMembers[category].sort((a, b) => {
          if (a.level !== b.level) return b.level - a.level;
          return a.name.localeCompare(b.name, 'ko-KR');
        });
        const colors = getCategoryColor(category);
        return (
          <div key={category} className="space-y-2">
            {/* 카테고리 헤더 */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} ${colors.border} border`}>
              <span className="text-lg">{getCategoryIcon(category)}</span>
              <div className="flex flex-col">
                <span className={`text-sm font-semibold ${colors.text}`}>{category}</span>
              </div>
              <span className={`text-xs ${colors.text} opacity-70 ml-auto`}>({categoryMembers.length}명)</span>
            </div>
            {/* 해당 카테고리의 팀원들 */}
            <div className="space-y-2 ml-4">
              {categoryMembers.map(member => {
                const levelColors = getLevelColor(member.level);
                return (
                  <div key={member.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-white border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-gray-900">{member.name}</div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${levelColors.bg} ${levelColors.text} ${levelColors.border} border`}>
                          {getLevelName(member.level)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleMemberEdit(member)} className="h-8 w-8 p-0 rounded-full">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">수정</span>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleMemberDelete(member.id)} className="h-8 w-8 p-0 rounded-full">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">삭제</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}