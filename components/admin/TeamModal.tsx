import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import React from "react";

interface Match {
  id: string;
  date: string;
  time: string;
  venue: string;
  voters?: Array<{
    name: string;
    vote: 'attend' | 'absent';
    votedAt: string;
    type: 'member' | 'guest';
    inviter?: string;
  }>;
}

interface TeamModalProps {
  showTeamModal: boolean;
  selectedMatch: Match | null;
  teamCount: number;
  setTeamCount: (count: number) => void;
  generatedTeams: string;
  handleGenerateTeams: () => void;
  copyToClipboard: () => void;
  shareToKakao: () => void;
  formatDate: (date: string) => {
    fullDate: string;
    isToday: boolean;
    isTomorrow: boolean;
  };
  setShowTeamModal: (show: boolean) => void;
}

export default function TeamModal({
  showTeamModal,
  selectedMatch,
  teamCount,
  setTeamCount,
  generatedTeams,
  handleGenerateTeams,
  copyToClipboard,
  shareToKakao,
  formatDate,
  setShowTeamModal,
}: TeamModalProps) {
  if (!showTeamModal || !selectedMatch) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
            <Users className="h-5 w-5" />자동 팀편성
          </CardTitle>
          <CardDescription className="text-center">
            {formatDate(selectedMatch.date).fullDate} {selectedMatch.time} - {selectedMatch.venue}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              참석자 {selectedMatch.voters?.filter((v: { vote: string }) => v.vote === 'attend').length || 0}명을 레벨 가중치에 따라 공평하게 팀을 나눕니다.
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teamCount">팀 개수</Label>
              <select
                id="teamCount"
                value={teamCount}
                onChange={e => setTeamCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              >
                {[2, 3].map(num => (
                  <option key={num} value={num}>{num}팀</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGenerateTeams} className="flex-1">팀편성 생성</Button>
              <Button variant="outline" onClick={() => setShowTeamModal(false)}>취소</Button>
            </div>

            {generatedTeams && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">팀편성 결과</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyToClipboard}>복사하기</Button>
                    <Button size="sm" variant="outline" onClick={shareToKakao} className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100">
                      카톡 공유
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800 break-words overflow-wrap-anywhere">{generatedTeams}</pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 