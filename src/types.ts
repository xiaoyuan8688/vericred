export type Language = 'cn' | 'en' | 'hi' | 'fa' | 'id' | 'th' | 'vi';

export interface Translation {
  // Splash Screen
  splashTitle: string;
  splashSubtitle: string;
  splashIntro: string;
  splashLoading: string;
  splashD1: string;
  splashR2: string;
  splashWorkers: string;
  splashAgent: string;
  splashSkip: string;
  splashEnter: string;

  // Header / Navbar
  brandName: string;
  brandTagline: string;
  navHome: string;
  navRegions: string;
  navAgent: string;
  navSuppliers: string;
  navMatchmaking: string;
  systemStatus: string;
  statusActive: string;
  statusSyncing: string;

  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroIntro: string;
  heroValue1Title: string;
  heroValue1Desc: string;
  heroValue2Title: string;
  heroValue2Desc: string;
  heroValue3Title: string;
  heroValue3Desc: string;

  // Regions Section
  regionsTitle: string;
  regionsSubtitle: string;
  regionSEA: string;
  regionAfrica: string;
  regionIndia: string;
  regionIran: string;
  regionEU: string;
  regionOtherClosed: string;
  regionDescSEA: string;
  regionDescAfrica: string;
  regionDescIndia: string;
  regionDescIran: string;
  regionDescEU: string;
  regionVerifiedCount: string;
  regionTrustLevel: string;
  regionActiveRequests: string;

  // Agent Simulator
  agentTitle: string;
  agentSubtitle: string;
  agentBtnSubmit: string;
  agentStatusIdle: string;
  agentStatusStep1: string;
  agentStatusStep2: string;
  agentStatusStep3: string;
  agentStatusStep4: string;
  agentStatusSuccess: string;
  agentDocType: string;
  agentDocCompany: string;

  // Supplier Directory
  supplierTitle: string;
  supplierSubtitle: string;
  filterAll: string;
  filterRegion: string;
  filterIndustry: string;
  indMachinery: string;
  indEnergy: string;
  indTextile: string;
  indElectronics: string;
  trustVerified: string;
  trustScore: string;
  btnViewReport: string;
  btnContact: string;
  lblVerificationItems: string;
  verifyRegistry: string;
  verifySite: string;
  verifyCustoms: string;
  verifyFinance: string;

  // Contact Modal
  contactTitle: string;
  contactSubtitle: string;
  formName: string;
  formCompany: string;
  formContact: string;
  formMessage: string;
  formSubmit: string;
  formSuccess: string;

  // Matchmaking Section
  matchTitle: string;
  matchSubtitle: string;
  matchRecent: string;
  matchSubmitBtn: string;

  // Footer & Tech
  techTitle: string;
  techSubtitle: string;
  techDesc: string;
  footerRights: string;
}

import { translations as importedTranslations } from './translations';
export const translations = importedTranslations;

export interface Supplier {
  id: string;
  nameCn: string;
  nameEn: string;
  industry: 'machinery' | 'energy' | 'textile' | 'electronics';
  region: 'sea' | 'africa' | 'india' | 'iran' | 'eu';
  logoText: string;
  descriptionCn: string;
  descriptionEn: string;
  trustScore: number;
  establishedYear: number;
  verifiedWorkers: number;
  plantAreaSqM: number;
  registryVerified: boolean;
  siteVerified: boolean;
  customsVerified: boolean;
  financeVerified: boolean;
  certificates: string[];
}

export const sampleSuppliers: Supplier[] = [
  {
    id: "sup-001",
    nameCn: "印尼雅加达衡精密液压模件厂",
    nameEn: "Jakarta Heng Precision Hydraulic Mold Manufacturing Co.",
    industry: "machinery",
    region: "sea",
    logoText: "HENG HYD",
    descriptionCn: "位于印尼雅加达高新工业区，拥有自主厂房8500平米，主营精密注塑模具与流体机械用液压阀块。经两国官方工商登记一致性核实，并在R2归档了实拍生产车间视频。",
    descriptionEn: "Located in Jakarta High-Tech Industrial Zone, owning 8,500 sq.m. factory floor. Specializes in precision injection molds and hydraulic blocks for fluid valves. Verified on-site and registered under D1 database.",
    trustScore: 97,
    establishedYear: 2018,
    verifiedWorkers: 120,
    plantAreaSqM: 8500,
    registryVerified: true,
    siteVerified: true,
    customsVerified: true,
    financeVerified: true,
    certificates: ["ISO9001:2015", "CE Certificate", "Indonesia SNI Standard"]
  },
  {
    id: "sup-002",
    nameCn: "尼日利亚莱基自贸区宏衡成套电网五金厂",
    nameEn: "Lekki Free Zone Hongheng Power Hardware Factory",
    industry: "electronics",
    region: "africa",
    logoText: "H-POWER",
    descriptionCn: "东非及西非电网建设特约供应商，位于拉各斯莱基自贸区。主产配电箱、高强度电缆桥架。实地探访核验确认该企业拥有210名本地注册员工，缴税评级良好，无司法纠纷。",
    descriptionEn: "Key power grid gear supplier in Lekki Free Zone, Lagos. Produces robust distribution cabinets and power hardware. On-site audits verify 210 local staff, clean litigation record, and active customs clearances.",
    trustScore: 95,
    establishedYear: 2020,
    verifiedWorkers: 210,
    plantAreaSqM: 12000,
    registryVerified: true,
    siteVerified: true,
    customsVerified: false, // Africa customs data lag during cloud sync, but manual check OK
    financeVerified: true,
    certificates: ["Nigeria SONCAP Certificate", "ISO14001", "ECOWAS Standard"]
  },
  {
    id: "sup-003",
    nameCn: "印度浦那衡信高科锂电池组装集成厂",
    nameEn: "Pune Hengxin Hi-Tech Lithium PACK Integration Ltd.",
    industry: "energy",
    region: "india",
    logoText: "HENG-BAT",
    descriptionCn: "位于浦那工业区，专注于轻型电动两轮/三轮动力电池包PACK生产。该企业印度国家银行基本户鉴权成功，出口信誉良好，无假冒仿造或海关欠税记录。",
    descriptionEn: "A verified Lithium PACK integration facility based in Pune. Supplies customized battery packages for EVs. Verified corporate SBI account integrity, and BIS quality credentials are mapped to D1.",
    trustScore: 94,
    establishedYear: 2021,
    verifiedWorkers: 85,
    plantAreaSqM: 6000,
    registryVerified: true,
    siteVerified: true,
    customsVerified: true,
    financeVerified: true,
    certificates: ["BIS Certificate (India)", "UN38.3 Shipping Spec", "CE Standards"]
  },
  {
    id: "sup-004",
    nameCn: "伊朗伊斯法罕特特变流体与耐磨阀体制造厂",
    nameEn: "Isfahan Tebian Wear-Resistant Valve & Fluid Co.",
    industry: "machinery",
    region: "iran",
    logoText: "ISFAHAN",
    descriptionCn: "伊斯法罕省重点工业配套厂，主产石化中下游用高压截止阀。经由特定安全核验线路调取并比对了其近三年稳定出关报关单据及对公金融信度。",
    descriptionEn: "A high-capability manufacturer of high-pressure valves in Isfahan. Verified via safe-channel checks demonstrating persistent logistics flows and corporate identity transparency for 3 years.",
    trustScore: 96,
    establishedYear: 2015,
    verifiedWorkers: 150,
    plantAreaSqM: 15000,
    registryVerified: true,
    siteVerified: true,
    customsVerified: true,
    financeVerified: true,
    certificates: ["API 6D Standard", "ISO9001 System", "ISIRI National Standard"]
  },
  {
    id: "sup-005",
    nameCn: "越南海防衡发针织印染服装集团",
    nameEn: "Hai Phong Hengfa Weaving & Dyeing Garment Group",
    industry: "textile",
    region: "sea",
    logoText: "HENGFA",
    descriptionCn: "越南海防市环保达标的高档纺织工业园成员，年产3000吨织造服装面料。实地厂区探视验证了全自动化污水在线监控、雇佣合规及稳定出关能力。",
    descriptionEn: "Eco-certified apparel weaving plant in Hai Phong. Outputs 3000 tons of textile fabrics annually. Verified for physical operations, environmental permits and active export clearance statistics.",
    trustScore: 98,
    establishedYear: 2019,
    verifiedWorkers: 320,
    plantAreaSqM: 25000,
    registryVerified: true,
    siteVerified: true,
    customsVerified: true,
    financeVerified: true,
    certificates: ["OEKO-TEX Standard 100", "GRS Global Recycled", "ISO9001 System"]
  },
  {
    id: "sup-006",
    nameCn: "肯尼亚蒙巴萨绿能太阳能设备及基建集成商",
    nameEn: "Mombasa Green Energy Solar & Infrastructure Integrator",
    industry: "energy",
    region: "africa",
    logoText: "M-CREDS",
    descriptionCn: "东非核心光伏离网逆变器、户用离网储能组装厂。实地盘点确认具备整洁的备件库与本地售后服务团队，通过了肯尼亚税务局(KRA)完税资格核查。",
    descriptionEn: "East African hub supplier for off-grid household solar setups. On-site verification validates components inventories, repair workshops and compliant tax status verified via KRA.",
    trustScore: 92,
    establishedYear: 2022,
    verifiedWorkers: 64,
    plantAreaSqM: 4200,
    registryVerified: true,
    siteVerified: true,
    customsVerified: false,
    financeVerified: true,
    certificates: ["Mombasa Local Assembly Permit", "KEBS Quality Standards"]
  }
];

export interface MatchmakingRequest {
  id: string;
  timestamp: string;
  sourceCn: string;
  sourceEn: string;
  targetRegion: string;
  requirementCn: string;
  requirementEn: string;
  status: 'matched' | 'verifying' | 'completed';
}

export const initialMatchmakingQueue: MatchmakingRequest[] = [
  {
    id: "match-101",
    timestamp: "10 mins ago",
    sourceCn: "浙江宁波某液压重机出口采购商",
    sourceEn: "Ningbo Hydraulic Heavy Equipment Buyer",
    targetRegion: "sea",
    requirementCn: "寻找印尼雅加达当地持有进口许可的流体阀体分销商并进行真实背景校验",
    requirementEn: "Seeking authorized fluid valves distributor in Jakarta with verified import licenses",
    status: "matched"
  },
  {
    id: "match-102",
    timestamp: "32 mins ago",
    sourceCn: "广东东莞太阳能光伏成套出口厂",
    sourceEn: "Dongguan Photovoltaic System Exporter",
    targetRegion: "india",
    requirementCn: "匹配印度北部通过BIS核验且有SBI活跃账户的户用电站集成实力商",
    requirementEn: "Matching solar integrators in Northern India with verified BIS status and active SBI accounts",
    status: "matched"
  },
  {
    id: "match-103",
    timestamp: "1 hour ago",
    sourceCn: "尼日利亚国家电力工程局拉各斯项目部",
    sourceEn: "Lagos Power Dept, Nigeria National Grid",
    targetRegion: "africa",
    requirementCn: "核查中国华东区3家实力特种电力变压器厂家的海外出口信誉度及R2实拍报告",
    requirementEn: "Verifying customs reputation & physical factory R2 clips of 3 heavy transformer exporters",
    status: "verifying"
  },
  {
    id: "match-104",
    timestamp: "3 hours ago",
    sourceCn: "山东临沂大型采掘装备及装载机制造集团",
    sourceEn: "Linyi Mining Loader & Drill Rig Group",
    targetRegion: "iran",
    requirementCn: "寻找德黑兰当地大型矿井的长期特种阀门供应配套，需要特定风控物流报告",
    requirementEn: "Seeking Tehran mining fluid valve clients with compliant transport and secure clearance certificates",
    status: "completed"
  }
];

