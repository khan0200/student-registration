import fetch from 'node-fetch';

const educationLevels = ['COLLEGE', 'BACHELOR', 'MASTERS'];
const universityOptions = {
  COLLEGE: ["SeoJeong", "Daewon", "Kunjang", "DIST", "SeoYeong", "Chungbuk", "Jangan", "Other"],
  MASTERS: [
    "Kangwon - E VISA", "SunMoon - E VISA", "Joon Bu - E VISA", "AnYang - E VISA",
    "SMIT - E VISA", "Woosuk - E VISA", "Dong eui E VISA", "Sejong", "Gachon", "BUFS",
    "Won Kwan - E VISA (Sertifikatsiz)", "Youngsan - E VISA (Sertifikatsiz)"
  ],
  BACHELOR: [
    "Busan University of Foreign Studies (BUFS)", "Chonnam National University", "Chung-Ang University", "Chungnam National University", 
    "Daegu Gyeongbuk Institute of Science and Technology (DGIST)", "Daegu University", "Daejin University", "Dong-A University", 
    "Dong-Eui University", "Ewha Womans University", "Far East University", "Gachon University", "Hankuk University of Foreign Studies", 
    "Hanyang University", "Incheon National University", "Inha University", "Jeonbuk National University", 
    "Kangwon National University", "Keimyung University", "Konkuk University", "Korea Advanced Institute of Science and Technology (KAIST)", 
    "Korea University", "Kookmin University", "Kyung Hee University", "Kyungpook National University", 
    "Pohang University of Science and Technology (POSTECH)", "Sejong University", "Seoul National University (SNU)", 
    "Semyung University", "Sogang University", "SunMoon University", "Sungkyunkwan University (SKKU)", "Sungshin Women's University", 
    "TongMyong University", "Ulsan National Institute of Science and Technology (UNIST)", "University of Seoul", "Yeungnam University", 
    "Yonsei University", "Other"
  ]
};
const languageCertificates = [
  'IELTS Expected', 'IELTS 5.5', 'IELTS 6.0', 'IELTS 6.5', 'IELTS 7.0', 'IELTS 7.5', 'IELTS 8.0', 'IELTS 8.5', 'IELTS 9.0',
  'TOPIK 2', 'TOPIK 3', 'TOPIK 4', 'TOPIK 5', 'TOPIK 6', 'TOPIK Expected'
];
const tariffs = ['STANDART', 'PREMIUM', 'VISA PLUS', '1FOIZ'];
const hearAboutUsOptions = ['Instagram', 'Friends', 'Topik Center', 'Seoul Study', 'Umidaxon', 'DDLC', 'ASCHOOL', 'Other'];
const statuses = ['Next semester', 'Elchixona', 'Visa', 'Passed', 'Other'];

function randomFrom(arr: any[]): any { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function pad(n: number): string { return n < 10 ? '0' + n : n.toString(); }

const firstNames = ['Ali', 'Vali', 'Jasur', 'Aziz', 'Bekzod', 'Dilshod', 'Sardor', 'Shahzod', 'Diyor', 'Ulugbek'];
const lastNames = ['Toshpulatov', 'Abdurazzakov', 'Karimov', 'Islomov', 'Saidov', 'Rakhimov', 'Yusupov', 'Nazarov', 'Ergashev', 'Mirzaev'];
const middleNames = ['Olim o‘g‘li', 'Ali o‘g‘li', 'Jasur o‘g‘li', 'Aziz o‘g‘li', 'Bekzod o‘g‘li', 'Dilshod o‘g‘li', 'Sardor o‘g‘li', 'Shahzod o‘g‘li', 'Diyor o‘g‘li', 'Ulugbek o‘g‘li'];

async function seed() {
  for (let i = 0; i < 30; i++) {
    const educationLevel = randomFrom(educationLevels);
    const universityList: any[] = universityOptions[educationLevel as keyof typeof universityOptions];
    const student = {
      lastName: randomFrom(lastNames).toUpperCase(),
      firstName: randomFrom(firstNames).toUpperCase(),
      middleName: randomFrom(middleNames).toUpperCase(),
      passportNumber: `AB${Math.floor(1000000 + Math.random() * 9000000)}`,
      birthDate: randomDate(new Date(1995, 0, 1), new Date(2010, 0, 1)).toISOString().split('T')[0],
      hearAboutUs: randomFrom(hearAboutUsOptions).toUpperCase(),
      phone1: `9${Math.floor(100000000 + Math.random() * 900000000)}`.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1-$2-$3-$4'),
      phone2: `9${Math.floor(100000000 + Math.random() * 900000000)}`.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1-$2-$3-$4'),
      email: `student${i + 1}@example.com`,
      address: `Random street ${i + 1}, City`,
      educationLevel,
      languageCertificate: randomFrom(languageCertificates),
      tariff: randomFrom(tariffs),
      university1: randomFrom(universityList),
      university2: randomFrom(universityList),
      additionalNotes: '',
      status: randomFrom(statuses),
    };
    await fetch('http://localhost:3000/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    console.log(`Added student ${i + 1}`);
  }
}

seed(); 