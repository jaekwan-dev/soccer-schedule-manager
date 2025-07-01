-- 기존 voters 데이터에 type과 inviter 필드 추가
-- 모든 기존 투표자는 팀원(member)으로 설정하고, inviter는 null로 설정

UPDATE matches 
SET voters = (
  SELECT json_agg(
    json_build_object(
      'name', voter->>'name',
      'vote', voter->>'vote',
      'votedAt', voter->>'votedAt',
      'type', 'member',
      'inviter', null
    )
  )
  FROM json_array_elements(voters) AS voter
)
WHERE voters IS NOT NULL; 