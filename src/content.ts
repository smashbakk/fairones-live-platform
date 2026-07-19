export type EditableEvent = {
  id: string;
  category: string;
  title: string;
  date: string;
  time: string;
  imageUrl: string;
  accent: string;
};

export type AppContent = {
  hero: {
    leftName: string;
    rightName: string;
    category: string;
    liveLabel: string;
    watchLabel: string;
    voteLabel: string;
    upcomingLabel: string;
    imageUrl: string;
  };
  featured: {
    eyebrow: string;
    title: string;
    intro: string;
    releaseTitle: string;
    releaseCaption: string;
    releaseImageUrl: string;
  };
  account: {
    displayName: string;
    email: string;
    location: string;
    bio: string;
  };
  events: EditableEvent[];
};

export const defaultContent: AppContent = {
  hero: {
    leftName: 'FUFFIE',
    rightName: 'BADMANBREAD',
    category: 'RAP BATTLE',
    liveLabel: 'UPCOMING · AUG 28',
    watchLabel: 'SET BATTLE REMINDER',
    voteLabel: 'CAST YOUR VOTE',
    upcomingLabel: 'UPCOMING',
    imageUrl: '',
  },
  featured: {
    eyebrow: 'FROM THE FAIR ONES ARCHIVE',
    title: 'FEATURED BATTLE',
    intro: 'Watch a released Fair Ones matchup and revisit the moment things got settled.',
    releaseTitle: 'OFFICIAL BATTLE RELEASE',
    releaseCaption: 'Now available from Fair Ones Live and SC Media.',
    releaseImageUrl: '',
  },
  account: {
    displayName: 'Fair Ones Member',
    email: 'member@fairones.live',
    location: 'United States',
    bio: 'Fair Ones supporter and live matchup voter.',
  },
  events: [
    { id: 'basketball-khalif-fuffie', category: '1-ON-1 BASKETBALL', title: 'KHALIF vs FUFFIE', date: 'AUG 22, 2026', time: '7:00 PM ET', imageUrl: '', accent: '#F1156C' },
    { id: 'chess-checkmate-logic', category: 'CHESS MATCH', title: 'CHECKMATE vs LOGIC', date: 'AUG 29, 2026', time: '6:00 PM ET', imageUrl: '', accent: '#1677FF' },
  ],
};
