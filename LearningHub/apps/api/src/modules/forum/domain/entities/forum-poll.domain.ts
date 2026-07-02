export interface ForumPollDomain {
  id: string;
  postId: string;
  question: string;
  endsAt: Date | null;
  isMultipleChoice: boolean;
}

export interface ForumPollOptionDomain {
  id: string;
  pollId: string;
  text: string;
  voteCount: number;
  displayOrder: number;
}

export interface ForumPollVoteDomain {
  pollId: string;
  optionId: string;
  userId: string;
}
