import { ImageSourcePropType } from 'react-native';

export type FairOnesEvent = {
  id: string;
  category: string;
  title: string;
  date: string;
  time: string;
  image: ImageSourcePropType;
  accent: string;
};

export const upcomingEvents: FairOnesEvent[] = [
  {
    id: 'basketball-khalif-fuffie',
    category: '1-ON-1 BASKETBALL',
    title: 'KHALIF vs FUFFIE',
    date: 'AUG 22, 2026',
    time: '7:00 PM ET',
    image: require('../../assets/basketball-match.png'),
    accent: '#F1156C',
  },
  {
    id: 'chess-checkmate-logic',
    category: 'CHESS MATCH',
    title: 'CHECKMATE vs LOGIC',
    date: 'AUG 29, 2026',
    time: '6:00 PM ET',
    image: require('../../assets/chess-match.png'),
    accent: '#1677FF',
  },
];
