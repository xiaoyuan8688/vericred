import { getApiConfig } from '../config/apiConfig';

export interface MarketMerchant {
  id: string;
  nameCn: string;
  nameEn: string;
  market: 'china' | 'southeast' | 'africa' | 'india' | 'iran';
  industry: 'machinery' | 'hardware' | 'textile' | 'chemical' | 'pharma' | 'electronics' | string;
  addressCn: string;
  addressEn: string;
  verificationTypes: Array<'video' | 'registry' | 'customs' | 'cross' | string>;
  trustScore: number;
  establishedYear: number;
  contactPerson: string;
  certifiedOutput: string;
  verificationLogs: string[];
}

// Sample market-specific merchant dataset (pre-loaded for visual representation, easily modifiable)
export const SAMPLE_MARKET_MERCHANTS: MarketMerchant[] = [
  // China Market
  {
    id: "m-cn-001",
    nameCn: "深圳宏泰电子元件制造厂",
    nameEn: "Shenzhen Hongtai Electronic Components Co., Ltd.",
    market: "china",
    industry: "electronics",
    addressCn: "广东省深圳市宝安区福海街道塘尾工业区A栋",
    addressEn: "Block A, Tangwei Industrial Zone, Baoan District, Shenzhen, Guangdong, China",
    verificationTypes: ["video", "registry", "cross"],
    trustScore: 98,
    establishedYear: 2014,
    contactPerson: "林经理 (Manager Lin)",
    certifiedOutput: "50,000,000 Units/Month",
    verificationLogs: [
      "2026-06-15: 远程视频实景探访设备成功连通，车间自动化贴片生产线24小时运转确认。",
      "2026-06-16: 深圳市工商档案交叉核验完成，商事登记处于正常营业活跃状态。",
      "2026-06-17: 获得国家高新技术企业(GRS)和ISO9001质管体系双重交叉资质认可。"
    ]
  },
  {
    id: "m-cn-002",
    nameCn: "浙江重德机电装配股份公司",
    nameEn: "Zhejiang Zhongde Mechatronics Assembly Corp.",
    market: "china",
    industry: "machinery",
    addressCn: "浙江省宁波市北仑区黄山路88号",
    addressEn: "No. 88 Huangshan Road, Beilun District, Ningbo, Zhejiang, China",
    verificationTypes: ["registry", "customs", "cross"],
    trustScore: 99,
    establishedYear: 2011,
    contactPerson: "陈工 (Engineer Chen)",
    certifiedOutput: "8,500 Sets/Month",
    verificationLogs: [
      "2026-05-20: 浙江省市场监督管理局商事登记核实，注册资金 5500万 元已实缴。",
      "2026-05-22: 宁波海关电子报关系统出口单据核验完成，近12个月离岸出口额达2.4亿美元。",
      "2026-05-25: 本地第三方独立审计行出具财务健康报告，无任何信用违约或诉讼记录。"
    ]
  },
  {
    id: "m-cn-003",
    nameCn: "佛山万达五金建材制造厂",
    nameEn: "Foshan Wanda Hardware & Building Materials Factory",
    market: "china",
    industry: "hardware",
    addressCn: "广东省佛山市南海区狮山工业园B区12号",
    addressEn: "No. 12 Area B, Shishan Industrial Park, Nanhai District, Foshan, Guangdong, China",
    verificationTypes: ["video", "registry", "customs"],
    trustScore: 97,
    establishedYear: 2016,
    contactPerson: "叶厂长 (Director Ye)",
    certifiedOutput: "12,000 Tons/Month",
    verificationLogs: [
      "2026-06-02: 远程视频流媒体镜头成功对准挤压模具车间，实时红外熔融监测状态优良。",
      "2026-06-03: 佛山市南海区工商行政档案在线调取核验无误。",
      "2026-06-05: 5月报关出口至东南亚及中东的五金管件合规率100%。"
    ]
  },
  {
    id: "m-cn-004",
    nameCn: "山东科创制药原料有限公司",
    nameEn: "Shandong Ke创 Pharmaceutical Raw Materials Co., Ltd.",
    market: "china",
    industry: "pharma",
    addressCn: "山东省济南市高新技术开发区药谷二路",
    addressEn: "Yaogu 2nd Road, High-Tech Development Zone, Jinan, Shandong, China",
    verificationTypes: ["registry", "cross"],
    trustScore: 96,
    establishedYear: 2018,
    contactPerson: "刘总监 (Director Liu)",
    certifiedOutput: "1,200 Tons/Month",
    verificationLogs: [
      "2026-04-18: 山东省药监局GMP符合性交叉比对通过，相关原药纯度测试符合国家标准。",
      "2026-04-20: 查询全国企业信用信息公示系统，无任何环境污染或行政处罚记录。"
    ]
  },
  {
    id: "m-cn-005",
    nameCn: "江苏恒利纺织印染有限公司",
    nameEn: "Jiangsu Hengli Textile & Dyeing Co., Ltd.",
    market: "china",
    industry: "textile",
    addressCn: "江苏省苏州市吴江区盛泽镇纺织大路",
    addressEn: "Textile Avenue, Shengze Town, Wujiang District, Suzhou, Jiangsu, China",
    verificationTypes: ["video", "customs"],
    trustScore: 95,
    establishedYear: 2015,
    contactPerson: "周经理 (Manager Zhou)",
    certifiedOutput: "8,000,000 Meters/Month",
    verificationLogs: [
      "2026-06-21: 远程高清安防网络流成功获取，环保排污实时监测接口数值符合环保规定。",
      "2026-06-23: 上海港海运出货单据、提单(B/L)与工厂实际产量实现100%账实吻合。"
    ]
  },
  {
    id: "m-cn-006",
    nameCn: "上海德胜绿色化工科技有限公司",
    nameEn: "Shanghai Desheng Green Chemical Tech Co., Ltd.",
    market: "china",
    industry: "chemical",
    addressCn: "上海市金山区精细化工产业园9区",
    addressEn: "Sector 9, Fine Chemical Industrial Park, Jinshan District, Shanghai, China",
    verificationTypes: ["video", "registry", "cross"],
    trustScore: 97,
    establishedYear: 2017,
    contactPerson: "张博士 (Dr. Zhang)",
    certifiedOutput: "3,500 Tons/Month",
    verificationLogs: [
      "2026-05-11: 工商局档案深度核准通过，注册专利权属无纠纷。",
      "2026-05-13: 探访装车储罐防爆级别现场，安全生产信息化集成系统符合防爆防毒一级规范。"
    ]
  },

  // Southeast Asia Market
  {
    id: "m-sea-001",
    nameCn: "越南海防德和精密五金厂",
    nameEn: "Vietnam Dehe Hardware Mfg Co., Ltd.",
    market: "southeast",
    industry: "hardware",
    addressCn: "越南海防市安阳工业园5号路",
    addressEn: "Road No. 5, An Duong Industrial Zone, Hai Phong City, Vietnam",
    verificationTypes: ["video", "registry", "customs"],
    trustScore: 96,
    establishedYear: 2019,
    contactPerson: "Tran Van (Audit Liaison)",
    certifiedOutput: "2,400 Tons/Month",
    verificationLogs: [
      "Verify on-site video feed: Machinery active and functional.",
      "Customs cross check: Shipping ledgers logged at Haiphong port verified."
    ]
  },
  {
    id: "m-sea-002",
    nameCn: "吉隆坡精电电子组装厂",
    nameEn: "Kuala Lumpur Smart Electronics Assembly",
    market: "southeast",
    industry: "electronics",
    addressCn: "马来西亚雪兰莪州八打灵再也高新园区",
    addressEn: "Petaling Jaya Industrial Sector, Selangor, Kuala Lumpur, Malaysia",
    verificationTypes: ["video", "cross"],
    trustScore: 94,
    establishedYear: 2021,
    contactPerson: "Lim Wei (Operations Coordinator)",
    certifiedOutput: "1,500,000 Boards/Month",
    verificationLogs: [
      "On-site camera feed connected via residential proxy.",
      "Regulatory audit: Compliant Malaysia SSM corporate filings confirmed."
    ]
  },

  // Africa Market
  {
    id: "m-af-001",
    nameCn: "拉各斯重工机电装备有限公司",
    nameEn: "Lagos Heavy Industry Mechatronics Ltd.",
    market: "africa",
    industry: "machinery",
    addressCn: "尼日利亚拉各斯莱基自贸区4区",
    addressEn: "Zone 4, Lekki Free Trade Zone, Lagos, Nigeria",
    verificationTypes: ["registry", "cross"],
    trustScore: 91,
    establishedYear: 2018,
    contactPerson: "Chinedu (Lekki Auditor)",
    certifiedOutput: "450 Heavy Units/Month",
    verificationLogs: [
      "Cross database checks: Verified Lekki FTZ corporate registries.",
      "Compliance audit: Double checked against Nigerian Custom Service (NCS) clearances."
    ]
  },

  // India Market
  {
    id: "m-in-001",
    nameCn: "孟买精细原料药中试基地",
    nameEn: "Mumbai Fine API Pharmaceutical Laboratory",
    market: "india",
    industry: "pharma",
    addressCn: "印度马哈拉施特拉邦孟买塔纳工业园",
    addressEn: "Thane Industrial Estate, Mumbai, Maharashtra, India",
    verificationTypes: ["video", "registry", "cross"],
    trustScore: 95,
    establishedYear: 2016,
    contactPerson: "A. Sharma (Liaison)",
    certifiedOutput: "80 Tons/Month (API grade)",
    verificationLogs: [
      "Chemical compliance: Indian FDA standard verification completed.",
      "Visual site stream active: Laboratory testing reactors functional."
    ]
  },

  // Iran Market
  {
    id: "m-ir-001",
    nameCn: "德黑兰特种聚合物石化工业联合体",
    nameEn: "Tehran Specialty Polymer Petrochemical Complex",
    market: "iran",
    industry: "chemical",
    addressCn: "伊朗德黑兰省卡拉季石化园区5街",
    addressEn: "5th Ave, Alborz Petrochemical District, Karaj, Tehran, Iran",
    verificationTypes: ["registry", "customs", "cross"],
    trustScore: 92,
    establishedYear: 2013,
    contactPerson: "H. Rezaei",
    certifiedOutput: "18,000 Tons/Month",
    verificationLogs: [
      "Verified on-site: Polymer silos active and compliant with National Petrochemical Co (NPC).",
      "Sanctions bypass legal clearance check completed by legal auditors."
    ]
  }
];

import { API_BASE_URL, FACTORY_DETAIL_URL, VIDEO_API_URL, REGISTRY_API_URL, CROSS_API_URL, RISK_API_URL, FACTORY_IMAGES_API_URL, PRODUCT_PHOTOS_API_URL } from '../config/apiEndpoints';
import { applySecurityShield } from './securityShield';

/**
 * Helper to validate if an endpoint URL is configured.
 * If empty, alerts and immediately terminates the network flow.
 */
function validateEndpoint(url: string) {
  if (!url || url.trim() === '') {
    const errorMsg = "服务网关地址尚未配置，请检查系统配置";
    try {
      window.alert(errorMsg);
    } catch (e) {
      console.warn("window.alert blocked:", e);
    }
    throw new Error(errorMsg);
  }
}

export interface PaginatedMerchants {
  data: MarketMerchant[];
  total: number;
  page: number;
  size: number;
}

export interface FactoryDetail {
  id: string;
  businessLicenseUrl: string;       // 营业执照链接
  videoPlaybackUrl: string;         // 视频核验回放地址
  customsDocuments: string[];       // 海关历史出货单据
  certifications: string[];         // 全部资质档案
}

export interface FetchMarketMerchantsParams {
  market: 'china' | 'southeast' | 'africa' | 'india' | 'iran';
  industry?: string;
  verificationType?: string;
  page?: number;                    // Current page number (1-indexed)
  size?: number;                    // Items per page
}

/**
 * Pre-allocated API Gateway to fetch verified merchants for different regions.
 * Features hollow structure to plug in an external scraping database or live Cloudflare Pages API.
 * Leverages API_BASE_URL to communicate with the headless worker backend securely.
 */
export async function fetchMarketMerchants(params: FetchMarketMerchantsParams): Promise<PaginatedMerchants> {
  await applySecurityShield();
  validateEndpoint(API_BASE_URL);
  const config = getApiConfig();
  const page = params.page || 1;
  const size = params.size || 4;
  
  console.log(`[API GATEWAY] Fetching market: ${params.market} via Base URL: ${API_BASE_URL}`);
  console.log(`[API GATEWAY] Current Config Registry Base: ${config.corporateRegistryUrl}`);
  
  // Real layout parsing and filtering using our decoupled data collection.
  // In a future production upgrade, this can be seamlessly replaced with:
  // const response = await fetch(`${API_BASE_URL}/merchants?market=${params.market}&industry=${params.industry || ''}&page=${page}&size=${size}`);
  // return await response.json();
  
  let filtered = SAMPLE_MARKET_MERCHANTS.filter(m => m.market === params.market);

  if (params.industry && params.industry !== 'all') {
    filtered = filtered.filter(m => m.industry === params.industry);
  }

  if (params.verificationType && params.verificationType !== 'all') {
    filtered = filtered.filter(m => m.verificationTypes.includes(params.verificationType));
  }

  const total = filtered.length;
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const slicedData = filtered.slice(startIndex, endIndex);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Allow testing failure if a special condition is met or just resolve
      // If we manually request something unsupported or simulated failure
      if (params.market as string === 'fail') {
        reject(new Error("Simulated API server connection error"));
      } else {
        resolve({
          data: slicedData,
          total,
          page,
          size
        });
      }
    }, 400); // Simulate network latency for loading state verification
  });
}

/**
 * Fetch detailed data for a specific factory, containing business license links,
 * video audit streams, custom dispatch records, and structural certificates.
 */
export async function fetchFactoryDetail(id: string): Promise<FactoryDetail> {
  await applySecurityShield();
  validateEndpoint(FACTORY_DETAIL_URL);
  console.log(`[API GATEWAY] Requesting detailed dossier for id: ${id} from endpoint: ${FACTORY_DETAIL_URL}`);

  // Real world integration:
  // const response = await fetch(`${FACTORY_DETAIL_URL}?id=${id}`);
  // return await response.json();

  const merchant = SAMPLE_MARKET_MERCHANTS.find(m => m.id === id);
  if (!merchant && id !== 'test-detail') {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Factory dossier not found")), 300);
    });
  }

  // Pre-compiled highly realistic factory dossiers
  const name = merchant ? merchant.nameEn : "Global Manufacturer";
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        businessLicenseUrl: `https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=1200&auto=format&fit=crop&referrerPolicy=no-referrer`,
        videoPlaybackUrl: "https://assets.mixkit.co/videos/preview/mixkit-industrial-robotic-arm-assembling-parts-42234-large.mp4",
        customsDocuments: [
          `VERCRED-CUSTOMS-BILL-${id || '001'}-A98X: Decrypted customs declaration list representing 100% genuine export throughput.`,
          `ON-BOARDING-MANIFEST-2026-Q2: Verified bill of lading ledger validated against local maritime port logs.`,
          `TARIFF-RECEIPT-TAX-PAID: Certified tax clearance slip confirming active business health score.`
        ],
        certifications: [
          "ISO 9001:2015 International Quality Management System Accreditation",
          "GRS (Global Recycled Standard) Ecology-certified Environmentally Safe Manufacturing",
          "OEKO-TEX Standard 100 High-Safety Fabric Guarantee Certificate",
          "SGS Group Authorized Independent On-Site Physical Production Audit Seal"
        ]
      });
    }, 350);
  });
}

/**
 * Fetch a single merchant's general profile.
 */
export async function fetchMerchantById(id: string): Promise<MarketMerchant | null> {
  await applySecurityShield();
  const merchant = SAMPLE_MARKET_MERCHANTS.find(m => m.id === id);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(merchant || null);
    }, 200);
  });
}

// Sub-page interface representations targeting specific API configurations
export interface VideoVerification {
  id: string;
  videoUrl: string;
  title: string;
  resolution: string;
  fps: number;
  relayNode: string;
  lastVerifiedAt: string;
}

export interface RegistryVerification {
  id: string;
  registrationNumber: string;
  establishedDate: string;
  legalRepresentative: string;
  registeredCapital: string;
  businessScopeCn: string;
  businessScopeEn: string;
  authorityCn: string;
  authorityEn: string;
}

export interface CrossVerificationItem {
  nameCn: string;
  nameEn: string;
  type: 'customs' | 'license' | 'report' | 'iso';
  number: string;
  issuedByCn: string;
  issuedByEn: string;
  issueDate: string;
  status: 'valid' | 'verified';
  descriptionCn: string;
  descriptionEn: string;
}

export interface CrossVerification {
  id: string;
  customsLedgers: string[];
  certifications: CrossVerificationItem[];
  thirdPartyReportsCn: string[];
  thirdPartyReportsEn: string[];
}

/**
 * ① Remote Live/Archived Video Stream API endpoint
 * Resolves back to config path: VIDEO_API_URL + `/${id}`
 */
export async function fetchVideoVerification(id: string): Promise<VideoVerification> {
  await applySecurityShield();
  validateEndpoint(VIDEO_API_URL);
  console.log(`[API GATEWAY] Requesting Video verification from: ${VIDEO_API_URL}/${id}`);
  
  // Production mapping example:
  // const response = await fetch(`${VIDEO_API_URL}/${id}`);
  // return await response.json();

  const merchant = SAMPLE_MARKET_MERCHANTS.find(m => m.id === id);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!merchant && id !== 'test-detail') {
        reject(new Error("Video log stream not found for ID: " + id));
        return;
      }
      resolve({
        id,
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-industrial-robotic-arm-assembling-parts-42234-large.mp4",
        title: merchant 
          ? `LIVE STREAM CHANNEL #${merchant.id.toUpperCase()}: ${merchant.nameEn} Assembly Plant` 
          : "LIVE STREAM CHANNEL #001: Automatic Production Area",
        resolution: "1080p (Full HD)",
        fps: 30,
        relayNode: "Cloudflare Warp Edge Relay (D1 Gateway)",
        lastVerifiedAt: "2026-07-03 UTC"
      });
    }, 300);
  });
}

/**
 * ② Enterprise Commercial Registry API endpoint
 * Resolves back to config path: REGISTRY_API_URL + `/${id}`
 */
export async function fetchRegistryVerification(id: string): Promise<RegistryVerification> {
  await applySecurityShield();
  validateEndpoint(REGISTRY_API_URL);
  console.log(`[API GATEWAY] Requesting Commercial Registry ledger from: ${REGISTRY_API_URL}/${id}`);
  
  const merchant = SAMPLE_MARKET_MERCHANTS.find(m => m.id === id);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!merchant && id !== 'test-detail') {
        reject(new Error("Registry record not found for ID: " + id));
        return;
      }
      
      const score = merchant ? merchant.trustScore : 90;
      const estYear = merchant ? merchant.establishedYear : 2018;
      const contact = merchant ? merchant.contactPerson : "Manager Guo";

      resolve({
        id,
        registrationNumber: `REG-CODE-91340100MA2P${id.toUpperCase()}`,
        establishedDate: `${estYear}-05-18`,
        legalRepresentative: contact,
        registeredCapital: "RMB 25,000,000 (Fully Paid-In / 实缴资本)",
        businessScopeCn: "智能工业化机械精密装配、技术研发服务，进出口自营业务，绿色低碳工艺改良。",
        businessScopeEn: "Precision smart industrial machinery manufacturing, software telemetry integrations, import and export operations, ecological process designs.",
        authorityCn: "国家工商行政管理局高新技术产业开发区分局",
        authorityEn: "Municipal Administration for Market Regulation (Hi-Tech Division)"
      });
    }, 300);
  });
}

/**
 * ③ Multi-dimensional Cross-match Custom Certificates API endpoint
 * Resolves back to config path: CROSS_API_URL + `/${id}`
 */
export async function fetchCrossVerification(id: string): Promise<CrossVerification> {
  await applySecurityShield();
  validateEndpoint(CROSS_API_URL);
  console.log(`[API GATEWAY] Requesting Cross verification reports from: ${CROSS_API_URL}/${id}`);
  
  const merchant = SAMPLE_MARKET_MERCHANTS.find(m => m.id === id);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!merchant && id !== 'test-detail') {
        reject(new Error("Cross certificates dossier not found for ID: " + id));
        return;
      }

      resolve({
        id,
        customsLedgers: [
          `VERCRED-SHIPPING-REC-N3321: Authorized export record showing global transit compliance.`,
          `CUSTOMS-LEDGER-Q2: Verified cargo customs duties cleared.`,
          `PORT-CARGO-INSPECTION-PASSED: Container safety scanner results confirmed valid.`
        ],
        certifications: [
          {
            nameCn: "ISO 9001:2015 国际质量管理体系认证证书",
            nameEn: "ISO 9001:2015 International Quality Management Seal",
            type: "iso",
            number: "ISO9001-Q2026-883",
            issuedByCn: "国家认证认可监督管理委员会 (CNCA) 授权评定中心",
            issuedByEn: "CNCA Authorized Quality Evaluation Bureau",
            issueDate: "2025-04-10",
            status: "valid",
            descriptionCn: "覆盖全链智能工厂研发与组装生产工艺，产品良品率实测高于99.98%。",
            descriptionEn: "Validates active quality controls across all precision smart assembly workflows with >99.98% product yield rate."
          },
          {
            nameCn: "GRS 全球回收标准环境合规声明书",
            nameEn: "GRS (Global Recycled Standard) Compliance",
            type: "iso",
            number: "GRS-ECO-2026-X11",
            issuedByCn: "瑞士通用公证行 (SGS Group)",
            issuedByEn: "SGS Group Independent Certification",
            issueDate: "2025-06-15",
            status: "verified",
            descriptionCn: "废品回收率与环保耗电指标均符合国际绿色低碳高标准体系规范。",
            descriptionEn: "Confirms strict environmental metrics on carbon emission cuts and recycled feedstocks."
          },
          {
            nameCn: "海关总署 AEO 高级认证企业备案",
            nameEn: "China Customs AEO Authorized Economic Operator Status",
            type: "customs",
            number: "AEO-CN-8839210",
            issuedByCn: "中华人民共和国海关总署",
            issuedByEn: "General Administration of Customs (GACC)",
            issueDate: "2024-11-20",
            status: "valid",
            descriptionCn: "享受全球数十个国家和地区海关的最低查验率和通关便利化豁免。",
            descriptionEn: "Grants green-lane customs clearances with expedited inspections across over 40 signatory nations."
          }
        ],
        thirdPartyReportsCn: [
          "SGS 深度实地产能测算及实名用工独立调查报告: 实测主产线满载日产能合规，无任何虚假空置产能。",
          "TÜV SÜD 安全生产与设备安全负载检测证书: 符合防爆及重型工业操作安全规范。"
        ],
        thirdPartyReportsEn: [
          "SGS On-Site Output Load Capacity & Legitimate Labor Audit Report: Active physical capacity validated.",
          "TÜV SÜD Work Safety & Load Bearing Certificate: Full machinery safety compliance signed."
        ]
      });
    }, 300);
  });
}

export interface ViolationRecord {
  date: string;
  reasonCn: string;
  reasonEn: string;
  regulatorCn: string;
  regulatorEn: string;
}

export interface RiskVerification {
  id: string;
  level: 'low' | 'medium' | 'high' | 'none';
  violations: ViolationRecord[];
}

/**
 * ④ Enterprise Risk Rating & Disciplinary Records API endpoint
 * Resolves back to config path: RISK_API_URL + `/${id}`
 */
export async function fetchRiskVerification(id: string): Promise<RiskVerification> {
  await applySecurityShield();
  validateEndpoint(RISK_API_URL);
  console.log(`[API GATEWAY] Requesting Risk Assessment from: ${RISK_API_URL}/${id}`);

  // Simulate remote lookup
  return new Promise((resolve) => {
    setTimeout(() => {
      // Determine risk level based on the last character or specific criteria of the merchant ID
      let level: 'low' | 'medium' | 'high' = 'low';
      let violations: ViolationRecord[] = [];

      // Give a few distinct mock records to demonstrate all states
      const codeSuffix = id.slice(-1);
      if (codeSuffix === '2' || codeSuffix === 'b' || codeSuffix === 'e') {
        level = 'medium';
        violations = [
          {
            date: "2025-09-12",
            reasonCn: "环保监测数据在线传输延迟（轻微异常，已于次日完成排查与技术校准）",
            reasonEn: "Brief online telemetry transmission delay of environmental monitoring data (minor warning, resolved next-day)",
            regulatorCn: "市生态环境局高新区分局",
            regulatorEn: "Municipal Ecology & Environment Department"
          }
        ];
      } else if (codeSuffix === '3' || codeSuffix === 'd' || codeSuffix === 'f') {
        level = 'high';
        violations = [
          {
            date: "2024-11-04",
            reasonCn: "因厂区仓储消防疏散标志陈旧，被责令限期整改并处以壹万元行政处罚（已整改复查合格）",
            reasonEn: "Fined RMB 10,000 for legacy warehouse fire safety signage; fully corrected and re-inspected with passing score",
            regulatorCn: "市消防安全应急救援大队",
            regulatorEn: "Municipal Fire and Rescue Brigade"
          },
          {
            date: "2025-02-18",
            reasonCn: "轻微劳务工时计算争议（涉及3名外部派遣工，已达成调解，足额拨付经济补偿）",
            reasonEn: "Minor labor hour computation dispute with 3 external contract staff (fully mediated with complete settlement paid)",
            regulatorCn: "市人力资源和社会保障局劳动监察支队",
            regulatorEn: "Municipal Bureau of Human Resources & Social Security"
          }
        ];
      } else {
        level = 'low';
        violations = []; // No violations
      }

      resolve({
        id,
        level,
        violations
      });
    }, 250);
  });
}

export interface FactoryImage {
  url: string;
  titleCn: string;
  titleEn: string;
}

export interface FactoryImagesVerification {
  id: string;
  images: FactoryImage[];
}

export interface ProductPhoto {
  url: string;
  categoryCn: string;
  categoryEn: string;
  shotDate: string;
  titleCn: string;
  titleEn: string;
}

export interface ProductPhotosVerification {
  id: string;
  photos: ProductPhoto[];
}

/**
 * ⑤ Factory Real Scene Images API endpoint
 * Resolves back to config path: FACTORY_IMAGES_API_URL + `/${id}`
 */
export async function fetchFactoryImages(id: string): Promise<FactoryImagesVerification> {
  await applySecurityShield();
  validateEndpoint(FACTORY_IMAGES_API_URL);
  console.log(`[API GATEWAY] Requesting Factory Images from: ${FACTORY_IMAGES_API_URL}/${id}`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate error path for specific custom IDs if needed, e.g. "error-demo"
      if (id === 'error-demo' || id === '9999') {
        reject(new Error("Factory images service unavailable"));
        return;
      }

      // Return high-quality, high-contrast real industrial scene photos
      const images: FactoryImage[] = [
        {
          url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
          titleCn: "主生产车间 - 智能化数控加工流水线",
          titleEn: "Main Assembly Hall - Intelligent CNC machining production line"
        },
        {
          url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
          titleCn: "物流与仓储中心 - 重型立体货架区",
          titleEn: "Logistics & Warehouse Center - Heavy-duty high-bay racking zone"
        },
        {
          url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
          titleCn: "质检与测试中心 - 数字化精密检测台",
          titleEn: "QA & Testing Center - Digital high-precision validation workbench"
        },
        {
          url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
          titleCn: "厂区外景 - 现代化制造示范基地大楼",
          titleEn: "Factory Exterior - Modern eco-manufacturing base and office lobby"
        }
      ];

      resolve({
        id,
        images
      });
    }, 200);
  });
}

/**
 * ⑥ Product Real Photos API endpoint
 * Resolves back to config path: PRODUCT_PHOTOS_API_URL + `/${id}`
 */
export async function fetchProductPhotos(id: string): Promise<ProductPhotosVerification> {
  await applySecurityShield();
  validateEndpoint(PRODUCT_PHOTOS_API_URL);
  console.log(`[API GATEWAY] Requesting Product Photos from: ${PRODUCT_PHOTOS_API_URL}/${id}`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 'error-demo' || id === '9999') {
        reject(new Error("Product photos service unavailable"));
        return;
      }

      // Return premium high-contrast product manufacturing samples
      const photos: ProductPhoto[] = [
        {
          url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
          categoryCn: "微电子及芯片精密基板",
          categoryEn: "Microelectronics & PCB Board Assembly",
          shotDate: "2026-05-18",
          titleCn: "精密主控集成线路板样品（首检打样，全金相层析达标）",
          titleEn: "Precision main control PCB board sample (Initial run, fully certified)"
        },
        {
          url: "https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?auto=format&fit=crop&w=800&q=80",
          categoryCn: "高抗冲击精密铸造件",
          categoryEn: "High-Strength Machining Metal Parts",
          shotDate: "2026-06-02",
          titleCn: "数控硬质合金精密铣切切削件（公差级控制在±0.02mm）",
          titleEn: "CNC hardened alloy milling parts (Tolerances kept within ±0.02mm)"
        },
        {
          url: "https://images.unsplash.com/photo-1589793907316-f94015548408?auto=format&fit=crop&w=800&q=80",
          categoryCn: "环保型聚合新材料原料",
          categoryEn: "Eco-Friendly Polymer Raw Materials",
          shotDate: "2026-06-21",
          titleCn: "阻燃防静电工程高分子母粒出库抽检",
          titleEn: "Flame-retardant anti-static polymer compound sample for shipping inspection"
        }
      ];

      resolve({
        id,
        photos
      });
    }, 200);
  });
}



