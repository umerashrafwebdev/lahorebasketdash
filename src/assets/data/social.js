import { addOrSubtractDaysFromDate } from '@/utils/date';
export const socialGroupsData = [{
  id: '301',
  groupName: 'General',
  name: 'HG',
  description: 'Good morning everyone !',
  time: addOrSubtractDaysFromDate(50),
  change: 1,
  variant: 'warning'
}, {
  id: '302',
  groupName: 'Project A',
  name: 'Rk',
  description: 'This themes is awesome! ...',
  time: addOrSubtractDaysFromDate(158),
  variant: 'success'
}, {
  id: '303',
  groupName: 'Project B',
  name: 'Susan',
  description: 'Hey...😊',
  time: addOrSubtractDaysFromDate(44),
  variant: 'warning'
}, {
  id: '304',
  groupName: 'Reporting',
  name: 'HK',
  description: 'Good Morning Everyone',
  time: addOrSubtractDaysFromDate(66),
  change: 5,
  variant: 'danger'
}, {
  id: '305',
  groupName: 'Work Reporting',
  name: 'Angela',
  description: 'Today work is...',
  time: addOrSubtractDaysFromDate(78),
  variant: 'success'
}, {
  id: '306',
  groupName: 'Meeting',
  name: 'HR',
  description: 'Next meeting today 10am',
  time: addOrSubtractDaysFromDate(89),
  change: 1,
  variant: 'primary'
}];
export const emailsData = [{
  id: '2001',
  fromId: '102',
  toId: '101',
  subject: 'Lucas Kriebel (@Daniel J. Olsen) has sent you a direct message on Twitter!',
  content: '@Daniel J. Olsen - Very cool :) Nicklas, You have a new direct message.',
  label: 'Primary',
  createdAt: new Date('11:49 am'),
  read: false,
  starred: false,
  important: true,
  deleted: false
}, {
  id: '2002',
  fromId: '103',
  toId: '101',
  subject: 'Images',
  label: 'Primary',
  attachments: [],
  createdAt: new Date('Feb 21'),
  read: true,
  starred: true,
  important: true,
  deleted: false
}, {
  id: '2003',
  fromId: '104',
  toId: '101',
  subject: 'Train/Bus',
  content: "Yes ok, great! I'm not stuck in Stockholm anymore, we're making progress.",
  label: 'Primary',
  createdAt: new Date('Feb 19'),
  read: true,
  starred: false,
  important: false,
  deleted: false
}, {
  id: '2004',
  fromId: '105',
  toId: '101',
  subject: "This Week's Top Stories",
  content: "Our top pick for you on Medium this week The Man Who Destroyed America's Ego",
  label: 'Primary',
  createdAt: new Date('Feb 28'),
  read: false,
  starred: false,
  important: false,
  deleted: false
}, {
  id: '2005',
  fromId: '106',
  toId: '101',
  label: 'Primary',
  attachments: [{
    name: 'dashboards.pdf'
  }, {
    name: 'pages-data.pdf'
  }],
  createdAt: new Date('Feb 28'),
  read: true,
  starred: true,
  important: false,
  deleted: false
}, {
  id: '2006',
  fromId: '107',
  toId: '101',
  label: 'Primary',
  attachments: [{
    name: 'doc1.doc'
  }, {
    name: 'doc2.doc'
  }, {
    name: 'doc3.doc'
  }, {
    name: 'doc4.doc'
  }],
  createdAt: new Date('Feb 27'),
  read: true,
  starred: false,
  important: true,
  deleted: false
}, {
  id: '2007',
  fromId: '108',
  toId: '101',
  subject: 'Regarding our meeting',
  content: "That's great, see you on Thursday!",
  label: 'Primary',
  createdAt: new Date('Feb 24'),
  read: false,
  starred: true,
  important: false,
  deleted: false
}, {
  id: '2008',
  fromId: '109',
  toId: '101',
  subject: "Task assigned: Clone ARP's website",
  content: 'You have been assigned a task by Alex@Work on the board Web.',
  label: 'Primary',
  createdAt: new Date('Feb 24'),
  read: false,
  starred: true,
  important: false,
  deleted: false
}, {
  id: '2009',
  fromId: '110',
  toId: '101',
  subject: "Let's go fishing!",
  content: "Hey, You wanna join me and Fred at the lake tomorrow? It'll be awesome.",
  label: 'Primary',
  createdAt: new Date('Feb 23'),
  read: true,
  starred: false,
  important: true,
  deleted: false
}, {
  id: '2010',
  fromId: '111',
  toId: '101',
  subject: 'Hey man',
  content: "Nah man sorry i don't. Should i get it?",
  label: 'Primary',
  createdAt: new Date('Feb 23'),
  read: true,
  starred: true,
  important: true,
  deleted: false
}, {
  id: '2011',
  fromId: '112',
  toId: '101',
  subject: '1 new items in your Stackexchange inbox',
  content: 'The following items were added to your Stack Exchange global inbox since you last checked it.',
  label: 'Primary',
  createdAt: new Date('Feb 21'),
  read: true,
  starred: true,
  important: false,
  deleted: false
}, {
  id: '2012',
  fromId: '102',
  toId: '101',
  subject: 'You can now use your storage in Google Drive',
  content: 'Hey Nicklas Sandell! Thank you for purchasing extra storage space in Google Drive.',
  label: 'Primary',
  createdAt: new Date('Feb 20'),
  read: true,
  starred: true,
  important: false,
  deleted: false
}, {
  id: '2013',
  fromId: '102',
  toId: '101',
  subject: 'Lucas Kriebel (@Daniel J. Olsen) has sent you a direct message on Twitter!',
  content: '@Daniel J. Olsen - Very cool :) Nicklas, You have a new direct message.',
  label: 'Social',
  createdAt: new Date('11:49 am'),
  read: false,
  starred: false,
  important: true,
  deleted: false
}, {
  id: '2014',
  fromId: '103',
  toId: '101',
  subject: 'Images',
  label: 'Promotions',
  attachments: [],
  createdAt: new Date('Feb 21'),
  read: false,
  starred: true,
  important: true,
  deleted: false
}, {
  id: '2015',
  fromId: '104',
  toId: '101',
  subject: 'Train/Bus',
  content: "Yes ok, great! I'm not stuck in Stockholm anymore, we're making progress.",
  label: 'Updates',
  createdAt: new Date('Feb 19'),
  read: false,
  starred: false,
  important: false,
  deleted: false
}, {
  id: '2016',
  fromId: '105',
  toId: '101',
  subject: "This Week's Top Stories",
  content: "Our top pick for you on Medium this week The Man Who Destroyed America's Ego",
  label: 'Forums',
  createdAt: new Date('Feb 28'),
  read: false,
  starred: false,
  important: false,
  deleted: false
}, {
  id: '2017',
  fromId: '106',
  toId: '101',
  label: 'Social',
  attachments: [{
    name: 'dashboards.pdf'
  }, {
    name: 'pages-data.pdf'
  }],
  createdAt: new Date('Feb 28'),
  read: true,
  starred: true,
  important: false,
  deleted: false
}, {
  id: '2018',
  fromId: '107',
  toId: '101',
  label: 'Promotions',
  attachments: [{
    name: 'doc1.doc'
  }, {
    name: 'doc2.doc'
  }, {
    name: 'doc3.doc'
  }, {
    name: 'doc4.doc'
  }],
  createdAt: new Date('Feb 27'),
  read: false,
  starred: false,
  important: true,
  deleted: false
}, {
  id: '2019',
  fromId: '108',
  toId: '101',
  subject: 'Regarding our meeting',
  content: "That's great, see you on Thursday!",
  label: 'Social',
  createdAt: new Date('Feb 24'),
  read: true,
  starred: true,
  important: false,
  deleted: false
}, {
  id: '2020',
  fromId: '109',
  toId: '101',
  subject: "Task assigned: Clone ARP's website",
  content: 'You have been assigned a task by Alex@Work on the board Web.',
  label: 'Updates',
  createdAt: new Date('Feb 24'),
  read: true,
  starred: true,
  important: false,
  deleted: false
}, {
  id: '2021',
  fromId: '110',
  toId: '101',
  subject: "Let's go fishing!",
  content: "Hey, You wanna join me and Fred at the lake tomorrow? It'll be awesome.",
  label: 'Updates',
  createdAt: new Date('Feb 23'),
  read: true,
  starred: false,
  important: true,
  deleted: false
}, {
  id: '2022',
  fromId: '111',
  toId: '101',
  subject: 'Hey man',
  content: "Nah man sorry i don't. Should i get it?",
  label: 'Forums',
  createdAt: new Date('Feb 23'),
  read: false,
  starred: true,
  important: true,
  deleted: false
}, {
  id: '2023',
  fromId: '112',
  toId: '101',
  subject: '1 new items in your Stackexchange inbox',
  content: 'The following items were added to your Stack Exchange global inbox since you last checked it.',
  label: 'Social',
  createdAt: new Date('Feb 21'),
  read: true,
  starred: true,
  important: false,
  deleted: false
}, {
  id: '2024',
  fromId: '102',
  toId: '101',
  subject: 'You can now use your storage in Google Drive',
  content: 'Hey Nicklas Sandell! Thank you for purchasing extra storage space in Google Drive.',
  label: 'Promotions',
  createdAt: new Date('Feb 20'),
  read: true,
  starred: true,
  important: false,
  deleted: false
}, {
  id: '2025',
  fromId: '103',
  toId: '101',
  subject: 'Hello',
  content: 'Trip home from Colombo has been arranged, then Jenna will come get me from Stockholm. :)',
  label: 'Updates',
  createdAt: new Date('Mar 6'),
  read: true,
  starred: false,
  important: true,
  deleted: false
}, {
  id: '2026',
  fromId: '104',
  toId: '101',
  subject: "Since you asked... and i'm inconceivably bored at the train station",
  content: "Alright thanks. I'll have to re-book that somehow, i'll get back to you.",
  label: 'Forums',
  createdAt: new Date('Mar 6'),
  read: true,
  starred: false,
  important: false,
  deleted: false
}, {
  id: '2027',
  fromId: '101',
  toId: '102',
  subject: 'Lucas Kriebel (@Daniel J. Olsen) has sent you a direct message on Twitter!',
  content: '@Daniel J. Olsen - Very cool :) Nicklas, You have a new direct message.',
  label: 'Social',
  createdAt: new Date('11:49 am'),
  read: true,
  starred: false,
  important: true,
  deleted: false
}, {
  id: '2028',
  fromId: '101',
  toId: '103',
  subject: 'Images',
  label: 'Promotions',
  attachments: [],
  createdAt: new Date('Feb 21'),
  read: true,
  starred: true,
  important: true,
  deleted: false
}, {
  id: '2029',
  fromId: '101',
  toId: '104',
  subject: 'Train/Bus',
  content: "Yes ok, great! I'm not stuck in Stockholm anymore, we're making progress.",
  label: 'Updates',
  createdAt: new Date('Feb 19'),
  read: true,
  starred: false,
  important: false,
  deleted: false
}, {
  id: '2030',
  fromId: '101',
  toId: '105',
  subject: "This Week's Top Stories",
  content: "Our top pick for you on Medium this week The Man Who Destroyed America's Ego",
  label: 'Forums',
  createdAt: new Date('Feb 28'),
  read: true,
  starred: false,
  important: false,
  deleted: false
}, {
  id: '2031',
  fromId: '101',
  toId: '106',
  label: 'Social',
  attachments: [{
    name: 'dashboards.pdf'
  }, {
    name: 'pages-data.pdf'
  }],
  createdAt: new Date('Feb 28'),
  read: true,
  starred: true,
  important: false,
  deleted: false
}, {
  id: '2032',
  fromId: '109',
  toId: '101',
  subject: "Task assigned: Clone ARP's website",
  content: 'You have been assigned a task by Alex@Work on the board Web.',
  label: 'Updates',
  createdAt: new Date('Feb 24'),
  read: true,
  starred: true,
  important: false,
  deleted: true
}, {
  id: '2033',
  fromId: '110',
  toId: '101',
  subject: "Let's go fishing!",
  content: "Hey, You wanna join me and Fred at the lake tomorrow? It'll be awesome.",
  label: 'Updates',
  createdAt: new Date('Feb 23'),
  read: true,
  starred: false,
  important: true,
  deleted: true
}];