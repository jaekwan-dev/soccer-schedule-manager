import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Users, Edit } from "lucide-react";
import React from "react";

interface MatchFormProps {
  formData: {
    date: string;
    time: string;
    venue: string;
    voteDeadline: string;
    voteDeadlineTime: string;
    maxAttendees: number | string;
    attendVotes: number;
    absentVotes: number;
  };
  setFormData: (data: MatchFormProps['formData']) => void;
  isEditing: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  venueSuggestions: string[];
  showVenueSuggestions: boolean;
  setShowVenueSuggestions: (show: boolean) => void;
}

export default function MatchForm({
  formData,
  setFormData,
  isEditing,
  handleSubmit,
  resetForm,
  venueSuggestions,
  showVenueSuggestions,
  setShowVenueSuggestions,
}: MatchFormProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {isEditing ? (
            <>
              <Edit className="h-4 w-4" />경기 수정
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />새 경기 등록
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="date" className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3" />경기 날짜
              </Label>
              <Input
                id="date"
                className="text-sm"
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1 text-sm">
                <Clock className="h-3 w-3" />경기 시간
              </Label>
              <div className="flex gap-2">
                <select
                  value={formData.time.split(":")[0] || ""}
                  onChange={e => {
                    const hour = e.target.value;
                    const minute = formData.time.split(":")[1] || "00";
                    setFormData({ ...formData, time: `${hour}:${minute}` });
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  required
                >
                  <option value="">시간</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>{i.toString().padStart(2, "0")}시</option>
                  ))}
                </select>
                <select
                  value={formData.time.split(":")[1] || ""}
                  onChange={e => {
                    const hour = formData.time.split(":")[0] || "00";
                    const minute = e.target.value;
                    setFormData({ ...formData, time: `${hour}:${minute}` });
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  required
                >
                  <option value="">분</option>
                  {["00", "15", "30", "45"].map(minute => (
                    <option key={minute} value={minute}>{minute}분</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 relative">
              <Label htmlFor="venue" className="flex items-center gap-1 text-sm">
                <MapPin className="h-3 w-3" />경기장
              </Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={e => {
                  setFormData({ ...formData, venue: e.target.value });
                  setShowVenueSuggestions(e.target.value.length > 0 && venueSuggestions.length > 0);
                }}
                onFocus={() => setShowVenueSuggestions(formData.venue.length > 0 && venueSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowVenueSuggestions(false), 150)}
                placeholder="경기장 이름"
                required
                className="text-sm"
              />
              {/* 자동완성 드롭다운 */}
              {showVenueSuggestions && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                  {venueSuggestions.filter(venue => venue.toLowerCase().includes(formData.venue.toLowerCase())).map((venue, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, venue });
                        setShowVenueSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {venue}
                      </div>
                    </button>
                  ))}
                  {venueSuggestions.filter(venue => venue.toLowerCase().includes(formData.venue.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">검색 결과가 없습니다</div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxAttendees" className="flex items-center gap-1 text-sm">
                <Users className="h-3 w-3" />최대인원
              </Label>
              <Input
                id="maxAttendees"
                type="number"
                min="1"
                max="50"
                value={formData.maxAttendees}
                onChange={e => {
                  const value = e.target.value;
                  if (value === "") {
                    setFormData({ ...formData, maxAttendees: "" });
                  } else {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue) && numValue >= 1 && numValue <= 50) {
                      setFormData({ ...formData, maxAttendees: numValue });
                    }
                  }
                }}
                placeholder="20"
                required
                className="text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="voteDeadline" className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3" />투표 마감일
              </Label>
              <Input
                id="voteDeadline"
                type="date"
                value={formData.voteDeadline}
                onChange={e => setFormData({ ...formData, voteDeadline: e.target.value })}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1 text-sm">
                <Clock className="h-3 w-3" />마감 시간
              </Label>
              <div className="flex gap-2">
                <select
                  value={formData.voteDeadlineTime.split(":")[0] || "23"}
                  onChange={e => {
                    const hour = e.target.value;
                    const minute = formData.voteDeadlineTime.split(":")[1] || "59";
                    setFormData({ ...formData, voteDeadlineTime: `${hour}:${minute}` });
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  required
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, "0")}>{i.toString().padStart(2, "0")}시</option>
                  ))}
                </select>
                <select
                  value={formData.voteDeadlineTime.split(":")[1] || "59"}
                  onChange={e => {
                    const hour = formData.voteDeadlineTime.split(":")[0] || "23";
                    const minute = e.target.value;
                    setFormData({ ...formData, voteDeadlineTime: `${hour}:${minute}` });
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  required
                >
                  {["00", "15", "30", "45", "59"].map(minute => (
                    <option key={minute} value={minute}>{minute}분</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 rounded-full text-sm py-2">
              {isEditing ? "수정하기" : "등록하기"}
            </Button>
            {isEditing && (
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-full text-sm py-2">
                취소
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 