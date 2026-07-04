import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Globe, Cpu, Database, Server, ExternalLink, 
  Search, Filter, Send, Play, AlertTriangle, HelpCircle, 
  Users, CheckCircle2, FileText, Smartphone, RefreshCw, Layers, Sparkles,
  Camera, Video, Eye, Building2, Scale, Share2, Award, CreditCard, Maximize2, MessageSquare,
  Wrench, Terminal
} from 'lucide-react';
import { Language, translations, Supplier, sampleSuppliers, MatchmakingRequest, initialMatchmakingQueue } from '../types';
import { getApiConfig, saveApiConfig, ApiConfig } from '../config/apiConfig';
import { 
  verifyFieldInspection, 
  verifyBusinessRegistry, 
  verifySocialProfile, 
  verifyCredentials 
} from '../services/verificationService';
import { writeToD1Database } from '../services/d1DatabaseService';
import { 
  fetchMarketMerchants, 
  MarketMerchant, 
  fetchFactoryDetail, 
  FactoryDetail,
  SAMPLE_MARKET_MERCHANTS,
  fetchMerchantById,
  fetchVideoVerification,
  fetchRegistryVerification,
  fetchCrossVerification,
  VideoVerification,
  RegistryVerification,
  CrossVerification
} from '../services/marketService';
import { VIDEO_API_URL, REGISTRY_API_URL, CROSS_API_URL } from '../config/apiEndpoints';
import FactoryDetailPage from './FactoryDetailPage';


interface MainPortalProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onShowIntro: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  isAdminMode: boolean;
  toggleAdminMode: () => void;
}

export default function MainPortal({ language, setLanguage, onShowIntro, activeSection, setActiveSection, isAdminMode, toggleAdminMode }: MainPortalProps) {
  const t = translations[language];

  // List of active suppliers (starts with samples)
  const [suppliers, setSuppliers] = useState<Supplier[]>(sampleSuppliers);
  const [matchQueue, setMatchQueue] = useState<MatchmakingRequest[]>(initialMatchmakingQueue);

  // Market routing state
  const [marketRoute, setMarketRoute] = useState<'china' | 'southeast' | 'africa' | 'india' | 'iran' | null>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/market/')) {
      const market = path.replace('/market/', '');
      if (['china', 'southeast', 'africa', 'india', 'iran'].includes(market)) {
        return market as any;
      }
    }
    return null;
  });

  // Factory routing state for detail views
  const [factoryRouteId, setFactoryRouteId] = useState<string | null>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/factory/')) {
      return path.replace('/factory/', '');
    }
    return null;
  });

  // Market subpage states
  const [marketMerchants, setMarketMerchants] = useState<MarketMerchant[]>([]);
  const [selectedMarketIndustry, setSelectedMarketIndustry] = useState<string>('all');
  const [selectedMarketVerification, setSelectedMarketVerification] = useState<string>('all');
  const [isMarketLoading, setIsMarketLoading] = useState<boolean>(false);
  const [selectedMerchantForDossier, setSelectedMerchantForDossier] = useState<MarketMerchant | null>(null);

  // Pagination states
  const [marketPage, setMarketPage] = useState<number>(1);
  const [marketPageSize, setMarketPageSize] = useState<number>(4);
  const [marketTotal, setMarketTotal] = useState<number>(0);
  const [marketFetchError, setMarketFetchError] = useState<string | null>(null);

  // Router fault tolerance state
  const [routeErrorToast, setRouteErrorToast] = useState<string | null>(null);

  // Detailed Factory Modal state
  const [selectedMerchantForDetail, setSelectedMerchantForDetail] = useState<MarketMerchant | null>(null);
  const [factoryDetail, setFactoryDetail] = useState<FactoryDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  // Keep path sync & router fault tolerance (USA or other regions redirect back to home with toast)
  useEffect(() => {
    const checkRouteAndFallback = (path: string) => {
      if (path.startsWith('/market/')) {
        const market = path.replace('/market/', '');
        if (!['china', 'southeast', 'africa', 'india', 'iran'].includes(market)) {
          // Push state home, set route to null, and trigger warning toast
          window.history.replaceState(null, '', '/');
          setMarketRoute(null);
          setFactoryRouteId(null);
          setRouteErrorToast(language === 'cn' ? '该区域暂未开放展示' : 'This region is currently not open for display');
          setTimeout(() => setRouteErrorToast(null), 5000);
          return true;
        } else {
          setMarketRoute(market as any);
          setFactoryRouteId(null);
          return false;
        }
      } else if (path.startsWith('/factory/')) {
        const id = path.replace('/factory/', '');
        const merchantExists = SAMPLE_MARKET_MERCHANTS.some(m => m.id === id);
        if (!merchantExists) {
          window.history.replaceState(null, '', '/');
          setMarketRoute(null);
          setFactoryRouteId(null);
          setRouteErrorToast(language === 'cn' ? '该工厂档案不存在' : 'This factory file does not exist');
          setTimeout(() => setRouteErrorToast(null), 5000);
          return true;
        } else {
          setFactoryRouteId(id);
          setMarketRoute(null);
          return false;
        }
      } else {
        setMarketRoute(null);
        setFactoryRouteId(null);
        return false;
      }
    };

    const handlePopState = () => {
      checkRouteAndFallback(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Check initial mount route
    checkRouteAndFallback(window.location.pathname);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [language]);

  // Fetch market merchants dynamically with pagination and robust error handlers
  useEffect(() => {
    if (!marketRoute) return;
    
    setIsMarketLoading(true);
    setMarketFetchError(null);
    
    fetchMarketMerchants({
      market: marketRoute,
      industry: selectedMarketIndustry,
      verificationType: selectedMarketVerification,
      page: marketPage,
      size: marketPageSize
    }).then((res) => {
      setMarketMerchants(res.data);
      setMarketTotal(res.total);
      setIsMarketLoading(false);
    }).catch((err) => {
      console.error("Failed to fetch market merchants:", err);
      // Fulfill requirement 1: Show "暂时无法加载工厂档案，请稍后重试" on connection failure
      setMarketFetchError(language === 'cn' ? "暂时无法加载工厂档案，请稍后重试" : "Unable to load factory archives at the moment, please try again later.");
      setIsMarketLoading(false);
    });
  }, [marketRoute, selectedMarketIndustry, selectedMarketVerification, marketPage, marketPageSize, language]);

  // Query detailed factory information for details modal
  useEffect(() => {
    if (!selectedMerchantForDetail) {
      setFactoryDetail(null);
      return;
    }

    setIsDetailLoading(true);
    fetchFactoryDetail(selectedMerchantForDetail.id)
      .then((detail) => {
        setFactoryDetail(detail);
        setIsDetailLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch factory detail:", err);
        setIsDetailLoading(false);
      });
  }, [selectedMerchantForDetail]);

  const navigateToMarket = (market: 'china' | 'southeast' | 'africa' | 'india' | 'iran') => {
    window.history.pushState(null, '', `/market/${market}`);
    setMarketRoute(market);
    // Reset filters and page on navigation
    setSelectedMarketIndustry('all');
    setSelectedMarketVerification('all');
    setMarketPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateBack = () => {
    window.history.pushState(null, '', '/');
    setMarketRoute(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // API Config states (modifiable)
  const [apiConfig, setApiConfigState] = useState<ApiConfig>(() => getApiConfig());
  const [corporateRegistryUrl, setCorporateRegistryUrl] = useState(apiConfig.corporateRegistryUrl);
  const [socialMediaDataUrl, setSocialMediaDataUrl] = useState(apiConfig.socialMediaDataUrl);
  const [customsDocumentUrl, setCustomsDocumentUrl] = useState(apiConfig.customsDocumentUrl);
  const [apiConfigSaveSuccess, setApiConfigSaveSuccess] = useState(false);

  // Advanced Crawler states
  const [crawlerUrl, setCrawlerUrl] = useState('https://asean-industrial-index.org/manufacturers');
  const [crawlerDepth, setCrawlerDepth] = useState<number>(3);
  const [crawlerThreads, setCrawlerThreads] = useState<number>(8);
  const [crawlerStatus, setCrawlerStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [crawlerLogs, setCrawlerLogs] = useState<string[]>([]);
  const [scrapedMerchantName, setScrapedMerchantName] = useState('');

  // Card Expansion State for "二级商家库" (Suppliers Directory subpage)
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);
  const [activePlateTab, setActivePlateTab] = useState<'field' | 'registry' | 'social' | 'credentials'>('field');
  const [previewCert, setPreviewCert] = useState<{ title: string; certNo: string; type: string } | null>(null);
  const [isPlayingSimVideo, setIsPlayingSimVideo] = useState<string | null>(null); // supplier ID that is playing video

  // Scroll to target section when activeSection changes (SPA view management)
  useEffect(() => {
    if (activeSection !== 'suppliers') {
      const timer = setTimeout(() => {
        const el = document.getElementById(activeSection);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeSection]);

  // Robust detailed records for each supplier mapped to the 4 plates
  const getSupplierDetailedData = (supplier: Supplier) => {
    const records: Record<string, any> = {
      "sup-001": {
        field: {
          videoTitle: language === 'cn' ? "雅加达精密液压车间现场走访实录" : "Jakarta Hydraulic Workshop Inspection",
          videoDuration: "02:14",
          auditor: language === 'cn' ? "张志国 (亚太核验一组组长)" : "Zhiguo Zhang (APAC Audit Team Lead)",
          auditDate: "2026-05-12",
          commentsCn: "该厂加工设备全部为进口品牌，中控室人员持证上岗率100%。现场抽检模件公差符合欧盟DIN标准。",
          commentsEn: "Equipped with imported CNC machinery. 100% certified operators. Random checks confirm tolerance compliance under European DIN standards.",
          photos: [
            { title: language === 'cn' ? "主厂房大楼外景" : "Main Plant Facility Exterior", desc: "8,500 ㎡" },
            { title: language === 'cn' ? "德玛吉5轴数控加工车间" : "DMG 5-Axis CNC Workshop", desc: "Precision Machining" },
            { title: language === 'cn' ? "成品高精度液压阀件检验" : "Hydraulic Valve Testing Lab", desc: "Quality Assurance" }
          ]
        },
        registry: {
          authority: language === 'cn' ? "印尼法律与人权部 & 投资协调委员会" : "Indonesian Ministry of Law & BKPM",
          regNo: "NIB 9120201412093",
          status: language === 'cn' ? "正常存续 / Active Operating" : "Active Operating",
          capital: "IDR 45,000,000,000",
          litigation: language === 'cn' ? "无司法诉讼纠纷 (0 Litigation)" : "0 Litigation / Clean Slate",
          taxRating: language === 'cn' ? "印尼财政部一级纳税合规信用" : "Grade-A Taxpayer Credit (Compliant)"
        },
        social: {
          platforms: [
            { name: "LinkedIn", count: "2,450+ Followers", status: "Verified Handle", link: "linkedin.com/company/hengprecision" },
            { name: "YouTube", count: "12,000+ Views", status: "Video Verified", link: "youtube.com/@hengprecision-id" },
            { name: "Facebook", count: "8,600+ Likes", status: "Active Page", link: "facebook.com/hengprecision.hydraulic" }
          ],
          postsCn: [
            "【参展通告】我们将于2026年9月亮相印尼雅加达国际机械工业展（3号馆D15）。",
            "【工艺升级】新引进了两台德国高精度切削机床，提升流体阀体出货精度至微米级。"
          ],
          postsEn: [
            "Exhibiting at Jakarta Manufacturing Indonesia 2026 (Hall 3, Booth D15). Join us!",
            "Upgraded our precision line with 2 German high-end milling stations, optimizing tolerance limits."
          ]
        },
        credentials: [
          { name: language === 'cn' ? "印尼官方工商执照 (NIB)" : "Official Business License (NIB)", type: "印尼工商局 NIB 数据底账", certNo: "NIB-9120201412093" },
          { name: language === 'cn' ? "ISO9001:2015 质量管理体系" : "ISO9001:2015 System Certification", type: "SGS 质量审查中心档案", certNo: "SG18/09281.02" },
          { name: language === 'cn' ? "印尼国家标准(SNI)强制合规证书" : "Indonesia SNI Standard Certification", type: "SNI 国家标准委质检账套", certNo: "SNI-28120-2024" }
        ]
      },
      "sup-002": {
        field: {
          videoTitle: language === 'cn' ? "莱基自贸区电网五金钣金冲压实地评估" : "Lekki Free Zone Power Hardware Inspection",
          videoDuration: "01:45",
          auditor: language === 'cn' ? "Adebayo (拉各斯核验分部)" : "Adebayo (Lagos Audit Branch)",
          auditDate: "2026-04-20",
          commentsCn: "西非电网重要配套单位，钣金冲压车间全自动防护等级优秀。物理盘点在册员工与纳税凭据完全一致。",
          commentsEn: "Lekki Free Zone electrical hardware node. Sheet metal stamping workshops operate with premium safety guards. 100% of staff verified with corporate tax records.",
          photos: [
            { title: language === 'cn' ? "莱基自贸区5号钢构厂房" : "Lekki Free Zone Block 5", desc: "12,000 ㎡" },
            { title: language === 'cn' ? "自动化钣金重型冲压线" : "Heavy Stamping Line", desc: "200-Ton Hydraulic Press" },
            { title: language === 'cn' ? "防盐雾高附着力喷涂线" : "Anti-Corrosion Coating Line", desc: "Powder Spraying" }
          ]
        },
        registry: {
          authority: language === 'cn' ? "尼日利亚联邦工商注册委员会 (CAC)" : "Corporate Affairs Commission (CAC) Nigeria",
          regNo: "RC 1702811",
          status: language === 'cn' ? "正常存续 / Active LLC" : "Active LLC",
          capital: "NGN 2,000,000,000",
          litigation: language === 'cn' ? "无司法纠纷与行政处罚记录" : "0 Corporate Litigation Cases",
          taxRating: language === 'cn' ? "FIRS (联邦税务局) 完税合规" : "FIRS Compliant Status (Tax Clearance)"
        },
        social: {
          platforms: [
            { name: "LinkedIn", count: "1,200+ Followers", status: "Verified LLC Profile", link: "linkedin.com/company/honghengpower" },
            { name: "WhatsApp Business", count: "Active Support", status: "Secure Handle Verified", link: "wa.me/23401702811" },
            { name: "X (Twitter)", count: "550+ Followers", status: "Corporate Feed", link: "x.com/hongheng_power" }
          ],
          postsCn: [
            "【自贸区动态】热烈欢迎尼日利亚电力部考察团莅临我厂，核验西非高压配电柜生产线。",
            "【产能扩张】新配置的200吨级液压自动折弯工作站已顺利投产。"
          ],
          postsEn: [
            "Honored to host the high-level delegation from the Nigeria Federal Ministry of Power at our LFZ hub.",
            "Our new 200-Ton CNC folding station has been successfully commissioned, boosting panel outputs."
          ]
        },
        credentials: [
          { name: language === 'cn' ? "CAC 注册公司证书" : "CAC Certificate of Incorporation", type: "尼日利亚联邦工商注册账册", certNo: "RC-1702811" },
          { name: language === 'cn' ? "尼日利亚国家标准局 SONCAP 证书" : "SONCAP Conformity Certificate", type: "SONCAP 强制关税核验底单", certNo: "SON-2025-A0811" },
          { name: language === 'cn' ? "莱基自贸区特许企业准入许可证" : "Lekki Free Zone FZE License", type: "拉各斯莱基自贸区运营牌照", certNo: "FZE-2020-093" }
        ]
      },
      "sup-003": {
        field: {
          videoTitle: language === 'cn' ? "浦那锂电PACK电芯分容与老化检测厂房探访" : "Pune Battery Pack Assembly Inspection",
          videoDuration: "03:05",
          auditor: language === 'cn' ? "Kumar (孟买核验分部)" : "Kumar (Mumbai Audit Branch)",
          auditDate: "2026-06-11",
          commentsCn: "车间具备高标准的万级防静电、恒温恒湿管控，电池组老化测试充放电机运转数据完全记录并上云。",
          commentsEn: "Operates anti-static cleanroom assembly. Cell testing, grading, and ageing diagnostic databases are continuously logged to cloud servers.",
          photos: [
            { title: language === 'cn' ? "防静电恒温分容车间" : "Anti-Static Grading Workshop", desc: "Class 10,000 Cleanroom" },
            { title: language === 'cn' ? "电池PACK自动点焊工作站" : "Automatic PACK Spot Welding", desc: "Dual-Pulse Welding" },
            { title: language === 'cn' ? "成品电池充放电老化测试线" : "Ageing & Cycle Diagnostic", desc: "Full Safety Monitoring" }
          ]
        },
        registry: {
          authority: language === 'cn' ? "印度公司事务部 (MCA)" : "Ministry of Corporate Affairs (MCA) India",
          regNo: "CIN U31904PN2021PTC201888",
          status: language === 'cn' ? "正常存续 / Active Private Ltd." : "Active Private Ltd.",
          capital: "INR 150,000,000",
          litigation: language === 'cn' ? "无司法诉讼争议 / 0 Legal Disputes" : "0 Disputes (MCA Registry Backcheck)",
          taxRating: language === 'cn' ? "GST 活跃纳税账户无欠税" : "GST Active & Compliant (No Outstanding Tax)"
        },
        social: {
          platforms: [
            { name: "LinkedIn", count: "3,100+ Followers", status: "Verified Business", link: "linkedin.com/company/hengxinbattery" },
            { name: "IndiaMART", count: "TrustSEAL Member", status: "Gold Catalog", link: "indiamart.com/hengxin-hitech" }
          ],
          postsCn: [
            "【新品推介】发布适用于重型快递三轮车的高循环耐低温锂电组 L-PACK 2.0。",
            "【合规报告】我司浦那基地通过了印度国家标准局BIS第12次年度合规审计。"
          ],
          postsEn: [
            "Launching our heavy-duty cold-resistant courier battery module: L-PACK 2.0. Built for durability.",
            "Proud to announce our Pune plant passed the annual BIS quality verification with perfect safety records."
          ]
        },
        credentials: [
          { name: language === 'cn' ? "印度 MCA 公司注册执照" : "MCA Certificate of Incorporation", type: "MCA 印度国家公司公示登记", certNo: "CIN-U31904PN2021" },
          { name: language === 'cn' ? "印度国家标准局 BIS 质量强制认证" : "BIS Safety & Quality Registration", type: "BIS 印度国家安全和标准局证书", certNo: "R-41092831" },
          { name: language === 'cn' ? "对公账户 SBI 资质开户行证明文件" : "State Bank of India (SBI) Account Ver.", type: "印度国家银行 SBI 资本账户存凭", certNo: "SBI-9012-AUTH" }
        ]
      },
      "sup-004": {
        field: {
          videoTitle: language === 'cn' ? "伊斯法罕重工截止阀铸造与气密性车间实访" : "Isfahan Foundry & Assembly Line Inspection",
          videoDuration: "02:50",
          auditor: language === 'cn' ? "Reza (德黑兰核验分部)" : "Reza (Tehran Audit Branch)",
          auditDate: "2026-03-14",
          commentsCn: "工厂配套实力过硬，拥有光谱材质快速分析仪，阀体水压、气密性100%全检，提供高标准出口底账。",
          commentsEn: "High manufacturing standard, equipped with rapid spectrometer material analyzers. 100% water and air pressure test coverage. Documented export clearances verified.",
          photos: [
            { title: language === 'cn' ? "高温熔炼与精密浇铸大厅" : "High-Temp Casting Hall", desc: "15,000 ㎡ Foundry" },
            { title: language === 'cn' ? "数控卧式精加工车间" : "Horizontal CNC Finishing", desc: "Heavy-Duty Lathes" },
            { title: language === 'cn' ? "截止阀多通道气密性压力测试" : "Valve Pressure Testing Station", desc: "API 6D Compliant" }
          ]
        },
        registry: {
          authority: language === 'cn' ? "伊朗企业及不动产登记局" : "Corporate Deeds Registration of Iran",
          regNo: "Reg No. 54210",
          status: language === 'cn' ? "正常存续 / Active Joint Stock" : "Active Joint Stock Company",
          capital: "IRR 500,000,000,000",
          litigation: language === 'cn' ? "无司法诉讼或劳资争议案件" : "0 Litigations / Clean Civil Records",
          taxRating: language === 'cn' ? "德黑兰大区税务局纳税合规合规" : "INTA Approved (Tax Compliant)"
        },
        social: {
          platforms: [
            { name: "Telegram Channel", count: "3,200+ Members", status: "Active Dispatch", link: "t.me/isfahan_valves" },
            { name: "Instagram Business", count: "5,400+ Followers", status: "Product Catalog", link: "instagram.com/isfahan.valves" }
          ],
          postsCn: [
            "【产能快报】本月向中东大型冶金项目顺利交付120套耐磨高压水闸阀组。",
            "【标准对标】我们的耐高压阀芯通过了美国API和欧洲CE多项流体测试测试。"
          ],
          postsEn: [
            "Successfully dispatched 120 sets of wear-resistant heavy valve blocks to an regional mining project.",
            "Our heavy valve seats passed strict API & CE flow tolerance checks at Islamic Azad Lab."
          ]
        },
        credentials: [
          { name: language === 'cn' ? "伊朗官方工商登记执照" : "Official Iran Business License", type: "德黑兰商会工商公示注册单据", certNo: "LIC-0481203921" },
          { name: language === 'cn' ? "API 6D 石油天然气管道阀门标准认证" : "API 6D Pipeline Valve Compliance", type: "API 美国石油学会重工体系许可", certNo: "API6D-09281" },
          { name: language === 'cn' ? "伊朗国家标准局 ISIRI 质量标认证" : "ISIRI Quality Standard Certificate", type: "ISIRI 国家质量规范备案凭据", certNo: "ISIRI-54210-A" }
        ]
      },
      "sup-005": {
        field: {
          videoTitle: language === 'cn' ? "海防大型织造染整环保指标与大圆机现场探视" : "Hai Phong Weaving & Eco-Dyeing Audit",
          videoDuration: "03:40",
          auditor: language === 'cn' ? "Nguyen (河内核验分部)" : "Nguyen (Hanoi Audit Branch)",
          auditDate: "2026-05-28",
          commentsCn: "越南环保达标示范企业，全自动化大圆机织造车间，中央染化料调配系统可防爆防污染，完税评级AAA。",
          commentsEn: "Model eco-friendly textile plant in Vietnam. Heavy automatic circular looms operate inside temperature-controlled bays. Grade-AAA local tax status.",
          photos: [
            { title: language === 'cn' ? "海防针织染整大圆机大楼" : "Hai Phong Circular Looms Bldg", desc: "25,000 ㎡" },
            { title: language === 'cn' ? "德国高速多功能圆织机" : "German High-Speed Looms", desc: "32-Gauge Fine Weft" },
            { title: language === 'cn' ? "中控全自染料配液系统" : "Central Dye Kitchen", desc: "Zero-Emission Monitoring" }
          ]
        },
        registry: {
          authority: language === 'cn' ? "越南计划与投资部 (MPI)" : "Vietnam Ministry of Planning & Investment",
          regNo: "MSN 0201928811",
          status: language === 'cn' ? "正常存续 / Active Joint Stock" : "Active Joint Stock Status",
          capital: "VND 120,000,000,000",
          litigation: language === 'cn' ? "无司法诉讼与环保违规纠纷" : "0 Litigation / Environmental Clear",
          taxRating: language === 'cn' ? "海防市税务部门AAA级优秀纳税信用" : "Hai Phong Grade-AAA Outstanding Taxpayer"
        },
        social: {
          platforms: [
            { name: "LinkedIn", count: "3,500+ Followers", status: "Verified Group", link: "linkedin.com/company/haiphongtextile" },
            { name: "YouTube", count: "25,000+ Views", status: "Promotional Tour Verified", link: "youtube.com/@haiphong-hengfa" }
          ],
          postsCn: [
            "【绿色供应链】我们成功更新了2026年度 OEKO-TEX Standard 100 生态织物最高等级评定认证。",
            "【产能速递】本季度集团已向欧盟与北美顶级零售巨头合规报关出口1200吨功能面料。"
          ],
          postsEn: [
            "Successfully renewed our OEKO-TEX Standard 100 (Class I) ecological credentials for export knitwear.",
            "Shipped over 1,200 tons of high-performance technical fabrics to EU & NA retailers this quarter."
          ]
        },
        credentials: [
          { name: language === 'cn' ? "越南官方企业营业执照 (MSN)" : "Vietnam Business Registration Cert", type: "越南计划与投资部商会公示", certNo: "MSN-0201928811" },
          { name: language === 'cn' ? "OEKO-TEX Standard 100 生态纺织认证" : "OEKO-TEX Standard 100 Eco-Cert", type: "瑞士 OEKO-TEX 绿色生态证书", certNo: "18.HCN.02981" },
          { name: language === 'cn' ? "GRS 全球回收标准再生涤纶资质证书" : "Global Recycled Standard Certificate", type: "GRS 国际环保材料循环认证档案", certNo: "GRS-2025-RECYCLED" }
        ]
      },
      "sup-006": {
        field: {
          videoTitle: language === 'cn' ? "蒙巴萨绿能光伏储能装配库存盘点现场" : "Mombasa Solar Assembly Hub Audit",
          videoDuration: "01:55",
          auditor: language === 'cn' ? "Kipchoge (内罗毕核验分部)" : "Kipchoge (Nairobi Audit Branch)",
          auditDate: "2026-02-10",
          commentsCn: "在东非当地具有扎实的组装、检测及质保备件库，通过了肯尼亚标准局KEBS质量大检，KRA缴税信用优良。",
          commentsEn: "Solid local warehousing, test beds, and customer backup arrays in East Africa. Passed rigorous KEBS standards checks and KRA audits.",
          photos: [
            { title: language === 'cn' ? "蒙巴萨绿能大仓储配送中心" : "Mombasa Solar Storage Hub", desc: "4,200 ㎡" },
            { title: language === 'cn' ? "半自动储能逆变器组装台" : "Inverter Assembly Bay", desc: "Static Testing Kits" },
            { title: language === 'cn' ? "基建集成防爆防雷试验场" : "Lightning Protection Testbed", desc: "Outdoor Simulation" }
          ]
        },
        registry: {
          authority: language === 'cn' ? "肯尼亚公司注册登记署 (BRS)" : "Business Registration Service Kenya",
          regNo: "PVT-96U882B",
          status: language === 'cn' ? "正常存续 / Active LLC" : "Active LLC Company Status",
          capital: "KES 80,000,000",
          litigation: language === 'cn' ? "无存续民商事或税务行政诉讼" : "0 Claims / Clear Regulatory Record",
          taxRating: language === 'cn' ? "肯尼亚税务局 (KRA) 税务评级合规" : "KRA Certified Compliant status"
        },
        social: {
          platforms: [
            { name: "Facebook", count: "15,200+ Likes", status: "Verified Page", link: "facebook.com/mombasasolar" },
            { name: "LinkedIn", count: "890+ Followers", status: "Hub Profile", link: "linkedin.com/company/mombasagreenenergy" }
          ],
          postsCn: [
            "【项目完工】我司承建的肯尼亚蒙巴萨港口1.2MW全功率商业光伏储能配电站成功合闸通电！",
            "【产品声明】在售的离网逆变器和家庭光伏系统已全面通过肯尼亚标准局KEBS认证。"
          ],
          postsEn: [
            "Proud to power up our 1.2MW commercial PV mini-grid system at Mombasa terminal on schedule!",
            "All residential solar systems and lithium storage cabinets now bear the official KEBS standardization mark."
          ]
        },
        credentials: [
          { name: language === 'cn' ? "肯尼亚官方注册证书" : "Kenya Certificate of Incorporation", type: "肯尼亚注册署企业入册证明", certNo: "PVT-96U882B" },
          { name: language === 'cn' ? "肯尼亚 KEBS 国家质量安全认证" : "KEBS Standardization Mark of Quality", type: "KEBS 肯尼亚国家标准检验记录", certNo: "KEBS-2025-PV" },
          { name: language === 'cn' ? "肯尼亚能监局 (EPRA) 储能并网执照" : "EPRA Solar PV Grid License", type: "EPRA 肯尼亚国家能源和石油管理局执照", certNo: "EPRA-PV-2026-A" }
        ]
      }
    };

    if (!records[supplier.id]) {
      return {
        field: {
          videoTitle: language === 'cn' ? `${supplier.nameCn} 自动智能系统核实探查` : `${supplier.nameEn} Agent Automated Site Inspection`,
          videoDuration: "01:10",
          auditor: language === 'cn' ? "VeriCred-MultiAgent (AI核验官)" : "VeriCred-MultiAgent (AI Auditor)",
          auditDate: new Date().toISOString().substring(0, 10),
          commentsCn: "该商家是由自研多Agent机器人抓取，在D1 SQL中自动做工商交叉比对，工商信息和主营业务高度吻合，信誉良好。",
          commentsEn: "This merchant was dynamically audited. Cross-matched business registers, tax records and satellite footprints are verified compliant in D1.",
          photos: [
            { title: language === 'cn' ? "工商及地理实景抓取" : "Dynamic Registry & Geographic Scan", desc: `${supplier.plantAreaSqM} ㎡` },
            { title: language === 'cn' ? "海关与出关集装箱对账" : "Customs Declaration Matching", desc: "Compliant" }
          ]
        },
        registry: {
          authority: language === 'cn' ? "当地国家工商公示系统" : "National Registry Authority",
          regNo: `REG-${supplier.id.toUpperCase()}`,
          status: language === 'cn' ? "正常存续 / ACTIVE" : "ACTIVE",
          capital: `${supplier.plantAreaSqM * 2000} Local Currency Equivalent`,
          litigation: language === 'cn' ? "无在审司法诉讼 / 0 Litigations" : "0 Active Litigations (Clear)",
          taxRating: language === 'cn' ? "人工智能比对：纳税良好" : "AI Analytics Match: Excellent tax compliance"
        },
        social: {
          platforms: [
            { name: "LinkedIn Profile", count: "Verified Handle", status: "Active Status Checked", link: `linkedin.com/company/${supplier.logoText.toLowerCase()}` }
          ],
          postsCn: ["【Agent系统自动抓取动态】：企业工商存续状态良好，无司法纠纷诉讼，经营活动正常。"],
          postsEn: ["[Agent Automated Activity Check]: Active operating, no judicial or customs issues matched."]
        },
        credentials: [
          { name: language === 'cn' ? "D1 结构化账单存根" : "D1 SQL Schema Integrity Stamp", type: "D1 SQL 数据湖密存单据", certNo: `D1-${supplier.id.toUpperCase()}` },
          { name: language === 'cn' ? "本地商会入驻推荐信" : "Local Chamber of Commerce Endorsement", type: "商会合规电子签名备案存根", certNo: "CHAMBER-2026-OK" }
        ]
      };
    }

    return records[supplier.id];
  };


  // Filter states
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [showEU, setShowEU] = useState<boolean>(false); // Collapsed/Optional EU toggle
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Agent Sandbox states
  const [agentCompany, setAgentCompany] = useState<string>('');
  const [agentRegion, setAgentRegion] = useState<'sea' | 'africa' | 'india' | 'iran' | 'eu'>('sea');
  const [agentIndustry, setAgentIndustry] = useState<'machinery' | 'energy' | 'textile' | 'electronics'>('machinery');
  const [agentStatus, setAgentStatus] = useState<'idle' | 'step1' | 'step2' | 'step3' | 'step4' | 'success'>('idle');

  // Contact Modal State
  const [selectedSupplierForContact, setSelectedSupplierForContact] = useState<Supplier | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Active Media Detail Modal State
  const [selectedSupplierForMedia, setSelectedSupplierForMedia] = useState<Supplier | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'certs' | 'registry'>('video');

  // New Custom Matchmaking Request state
  const [customReqRegion, setCustomReqRegion] = useState<'sea' | 'africa' | 'india' | 'iran' | 'eu'>('sea');
  const [customReqText, setCustomReqText] = useState('');
  const [customReqSubmitted, setCustomReqSubmitted] = useState(false);

  // Trigger simulated multi-Agent system
  const handleRunAgentVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentCompany.trim()) return;

    setAgentStatus('step1');

    // Simulate Agent Steps Pipeline and trigger stubs sequentially
    setTimeout(() => {
      // Plate ①: On-Site Field Inspection (实地实景探访)
      verifyFieldInspection({ companyName: agentCompany, region: agentRegion });
      setAgentStatus('step2');
    }, 1500);

    setTimeout(() => {
      // Plate ②: Official Corporate Registry Check (官方征信交叉)
      verifyBusinessRegistry({ companyName: agentCompany, region: agentRegion });
      setAgentStatus('step3');
    }, 3000);

    setTimeout(() => {
      // Plate ③: Social Profile Verification & Plate ④: Customs/Credentials Validation
      verifySocialProfile({ companyName: agentCompany });
      verifyCredentials({ companyName: agentCompany });
      setAgentStatus('step4');
    }, 4500);

    setTimeout(() => {
      // Auto-insert the new verified enterprise into our local state & write to pre-allocated D1 Database
      const newSupplier: Supplier = {
        id: `sup-${Date.now()}`,
        nameCn: agentCompany + " (Agent自动回填)",
        nameEn: agentCompany + " (Auto Structured by Agent)",
        industry: agentIndustry,
        region: agentRegion,
        logoText: agentCompany.substring(0, 4).toUpperCase(),
        descriptionCn: `该公司经自研多Agent引擎对工商、海关、R2媒体存根及纳税数据多维交叉比对，信息真实度及资金安全性评级优良，自动回填D1结构化表单。`,
        descriptionEn: `Cross-analyzed with tax authorities, customs declarations and digital R2 media logs by VeriCred AI Agent. Automatically committed into D1 Serverless SQL schema.`,
        trustScore: Math.floor(Math.random() * 8) + 90, // score between 90-97
        establishedYear: 2021,
        verifiedWorkers: Math.floor(Math.random() * 150) + 40,
        plantAreaSqM: Math.floor(Math.random() * 12000) + 3000,
        registryVerified: true,
        siteVerified: true,
        customsVerified: true,
        financeVerified: true,
        certificates: ["AI-Verified Credentials", "CE Conformity", "ISO9001 System"]
      };

      // Call pre-allocated Cloudflare D1 write stub
      writeToD1Database(newSupplier).then((d1Result) => {
        console.log("[D1 Database Service Commit Succeeded]", d1Result);
      });

      setSuppliers(prev => [newSupplier, ...prev]);
      setAgentStatus('success');
      setAgentCompany('');
    }, 6000);
  };

  // Trigger Advanced Scraper Simulation (Requirement 4)
  const handleTriggerAdvancedScraper = () => {
    const targetName = scrapedMerchantName.trim() || (language === 'cn' ? '越南海防德和精密五金厂' : 'Vietnam Dehe Hardware Mfg');
    setCrawlerStatus('running');
    setCrawlerLogs([]);

    const logSteps = [
      `[00:00] [Crawler Main] Dispatching scraping worker agents to target seed: ${crawlerUrl}`,
      `[00:01] [Crawler Agent-01] Rotating residential proxies. Connecting to headers...`,
      `[00:02] [Crawler Agent-01] HTTP GET 200 Succeeded. Raw HTML size: 142.8 KB.`,
      `[00:03] [Parsing Agent] Analyzing document structures and extracting candidate profiles...`,
      `[00:04] [Parsing Agent] Target verified: found matching enterprise name "${targetName}".`,
      `[00:05] [Verification Hub] Initializing four independent verification channels...`,
      `[00:06] [Plate ① Dispatcher] Calling verifyFieldInspection() for On-Site verification...`,
      `[00:07] [Plate ① Result] On-site active operating state confirmed. Stored inspection stream live.`,
      `[00:08] [Plate ② Dispatcher] Calling verifyBusinessRegistry() using config: ${corporateRegistryUrl}`,
      `[00:09] [Plate ② Result] Registration verified. Status: ACTIVE_COMPLIANT. Capital: 8,000,000 USD Equiv.`,
      `[00:10] [Plate ③ Dispatcher] Calling verifySocialProfile() using config: ${socialMediaDataUrl}`,
      `[00:11] [Plate ③ Result] Extracted 2 valid social channels. Active social index is High.`,
      `[00:12] [Plate ④ Dispatcher] Calling verifyCredentials() using config: ${customsDocumentUrl}`,
      `[00:13] [Plate ④ Result] Customs verified. Found 56 active exports under compliance ranking A.`,
      `[00:14] [D1 Database Connector] Committing newly verified entity metadata to Cloudflare D1 SQL...`,
      `[00:15] [D1 Database Connector] SUCCESS: writeToD1Database() returned changes=1, insertedId=sup-scraped-${Date.now()}`,
      `[00:16] [D1 Database Connector] Commit SQL: INSERT INTO verified_suppliers (id, name_cn, name_en, industry, region, trust_score) VALUES ('sup-scraped-${Date.now()}', '${targetName}', '${targetName} Export', 'machinery', 'sea', 96);`,
      `[00:17] [Crawler Main] Verification complete. Dynamic sync accomplished. Added ${targetName} to list.`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logSteps.length) {
        setCrawlerLogs(prev => [...prev, logSteps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setCrawlerStatus('success');
        
        // Auto-insert scraped supplier to state
        const newSupplier: Supplier = {
          id: `sup-scraped-${Date.now()}`,
          nameCn: targetName,
          nameEn: targetName + " Export Co., Ltd.",
          industry: "machinery",
          region: "sea",
          logoText: "DEHE_HW",
          descriptionCn: `该公司经由高级采集 Agent 引擎在 ${crawlerUrl} 深度索引发现。通过四大核验通道交叉比对，工商注册在案，拥有 56 笔活跃出口记录，已成功入库 D1 数据库。`,
          descriptionEn: `Discovered and compiled via advanced data crawling agents indexing ${crawlerUrl}. Cross-verified by multi-agent subroutines and committed to Cloudflare D1.`,
          trustScore: 96,
          establishedYear: 2019,
          verifiedWorkers: 112,
          plantAreaSqM: 9500,
          registryVerified: true,
          siteVerified: true,
          customsVerified: true,
          financeVerified: true,
          certificates: ["CE Conformity", "ISO9001 System", "Vietnam Standard"]
        };
        
        setSuppliers(prev => [newSupplier, ...prev]);
        setScrapedMerchantName('');
      }
    }, 450);
  };

  // Submit supply-demand matching
  const handleCustomMatchmaking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReqText.trim()) return;

    const newMatch: MatchmakingRequest = {
      id: `match-${Date.now()}`,
      timestamp: "Just now",
      sourceCn: language === 'cn' ? "您提交的采购匹配商" : "Custom Match Request",
      sourceEn: language === 'cn' ? "您提交的采购匹配商" : "Custom Match Request",
      targetRegion: customReqRegion,
      requirementCn: customReqText,
      requirementEn: customReqText,
      status: "verifying"
    };

    setMatchQueue(prev => [newMatch, ...prev]);
    setCustomReqText('');
    setCustomReqSubmitted(true);
    setTimeout(() => setCustomReqSubmitted(false), 5000);
  };

  // Filter Logic
  const filteredSuppliers = suppliers.filter(sup => {
    // Search query matches company name
    const matchesSearch = 
      sup.nameCn.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sup.nameEn.toLowerCase().includes(searchQuery.toLowerCase());

    // Region matches filter
    const matchesRegion = selectedRegion === 'all' ? true : sup.region === selectedRegion;

    // Industry matches filter
    const matchesIndustry = selectedIndustry === 'all' ? true : sup.industry === selectedIndustry;

    // EU filtering. If showEU is false and supplier region is 'eu', hide it unless selectedRegion is specifically 'eu'
    const isEUSupplier = sup.region === 'eu';
    if (!showEU && isEUSupplier && selectedRegion !== 'eu') {
      return false;
    }

    return matchesSearch && matchesRegion && matchesIndustry;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Route Error Alert Toast Banner */}
      {routeErrorToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-md animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-slate-900 border border-amber-500/50 p-4 rounded-xl shadow-2xl shadow-amber-950/20 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs font-bold text-slate-200 block">{language === 'cn' ? '系统提示' : 'System Notice'}</span>
              <span className="text-xs text-slate-400 mt-1 block leading-relaxed">{routeErrorToast}</span>
            </div>
            <button 
              onClick={() => setRouteErrorToast(null)}
              className="text-slate-400 hover:text-slate-200 text-xs font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer"
            >
              [X]
            </button>
          </div>
        </div>
      )}

      {factoryRouteId ? (
        /* ========================================================== */
        /* FACTORY SUBPAGE DETAIL PAGE (3 Tabs: video, registry, cross) */
        /* ========================================================== */
        <FactoryDetailPage 
          id={factoryRouteId}
          language={language}
          onBack={() => {
            const merchant = SAMPLE_MARKET_MERCHANTS.find(m => m.id === factoryRouteId);
            if (merchant) {
              window.history.pushState(null, '', `/market/${merchant.market}`);
              setMarketRoute(merchant.market);
            } else {
              window.history.pushState(null, '', '/');
              setMarketRoute(null);
            }
            setFactoryRouteId(null);
          }}
        />
      ) : marketRoute ? (
        /* ========================================================== */
        /* SECONDARY MARKET DETAIL PAGE (Unified layout specification) */
        /* ========================================================== */
        <section className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-[fadeIn_0.4s_ease-out]">
          {/* Breadcrumbs & Navigation Back */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={navigateBack}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-300 border border-slate-800 hover:border-cyan-500/50 rounded-lg flex items-center gap-2 transition-all cursor-pointer group"
            >
              <span>&larr;</span>
              <span>{language === 'cn' ? '返回主门户' : 'Back to Home Portal'}</span>
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="hover:text-cyan-400 cursor-pointer" onClick={navigateBack}>{language === 'cn' ? '首页' : 'Home'}</span>
              <span>/</span>
              <span className="text-slate-300 uppercase">{marketRoute}</span>
            </div>
          </div>

          {/* Core Header with stats */}
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/40 text-cyan-400 font-mono">
                  {language === 'cn' ? '已核验区域产业市场' : 'VERIFIED REGION INDUSTRIAL SECTOR'}
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-slate-100 mt-2 flex items-center gap-2">
                  <span>
                    {marketRoute === 'china' ? (language === 'cn' ? '中国产业源头基地' : 'China Industry Source Base') :
                     marketRoute === 'southeast' ? (language === 'cn' ? '东南亚(越/印尼/泰/马)名录' : 'Southeast Asia (VN/ID/TH/MY) Directory') :
                     marketRoute === 'africa' ? (language === 'cn' ? '非洲市场(拉各斯/蒙巴萨)名录' : 'Africa Markets (Lagos/Mombasa) Directory') :
                     marketRoute === 'india' ? (language === 'cn' ? '印度地区(制药及纺织)名录' : 'India Region (Pharma & Textile) Directory') :
                     (language === 'cn' ? '伊朗特定工业专线名录' : 'Iran Specific Industrial Line Directory')}
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
                  {marketRoute === 'china' ? (language === 'cn' ? '汇集国内最优质源头生产工厂，通过实地实景探访与海关大盘交叉审计，提供全链路防伪实物档案备案，致力于面向全球做定向供需对接。' : 'Showcasing primary manufacturing sources in mainland China, direct from factory floors with audited customs ledgers and live real-scene stream support.') :
                   language === 'cn' ? `此专区中所有入库商家均已通过本地物理审计并建立可查证档案，数据持久保存在区块链及D1数据体系中。` : `All listing enterprises under this region have completed rigorous local audits and have been indexed securely in cloud database system.`}
                </p>
              </div>

              {/* Dynamic Stats block */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 font-mono text-xs min-w-[240px]">
                <div>
                  <div className="text-slate-500">{language === 'cn' ? '已审核实体数' : 'Entities Audited'}</div>
                  <div className="text-lg font-bold text-cyan-400 mt-0.5">
                    {marketRoute === 'china' ? '350+' : marketRoute === 'southeast' ? '142' : marketRoute === 'africa' ? '89' : marketRoute === 'india' ? '116' : '64'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">{language === 'cn' ? '安全监测指数' : 'Trust Score'}</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    {marketRoute === 'china' ? '99.8%' : marketRoute === 'southeast' ? '98.4%' : marketRoute === 'africa' ? '92.1%' : marketRoute === 'india' ? '95.8%' : '90.2%'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TWO LEVEL FILTERING MODULE (两级筛选模块) */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 mb-8 backdrop-blur-md">
            
            {/* Level 1 Filter: Industry Filtering (产业筛选栏目) */}
            <div className="mb-6 pb-6 border-b border-slate-800">
              <label className="block text-xs font-mono font-bold text-cyan-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                <span>{language === 'cn' ? '一、细分产业品类筛选' : 'I. Industry Classification Filter'}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', labelCn: '全部产业 (All)', labelEn: 'All Industries' },
                  { value: 'machinery', labelCn: '机电装配 (Machinery)', labelEn: 'Electrical & Machinery' },
                  { value: 'hardware', labelCn: '五金建材 (Hardware)', labelEn: 'Hardware & Building Materials' },
                  { value: 'textile', labelCn: '纺织品类 (Textile)', labelEn: 'Textiles & Apparel' },
                  { value: 'chemical', labelCn: '化学工业 (Chemical)', labelEn: 'Chemicals' },
                  { value: 'pharma', labelCn: '制药工业 (Pharma)', labelEn: 'Pharmaceuticals' },
                  { value: 'electronics', labelCn: '电子元件 (Electronics)', labelEn: 'Electronic Components' }
                ].map((ind) => (
                  <button
                    key={ind.value}
                    onClick={() => {
                      setSelectedMarketIndustry(ind.value);
                      setMarketPage(1); // Reset page on filter toggle
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      selectedMarketIndustry === ind.value
                        ? 'bg-cyan-500 border-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-950/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {language === 'cn' ? ind.labelCn : ind.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Level 2 Filter: Verification Type (核验类型筛选栏目) */}
            <div>
              <label className="block text-xs font-mono font-bold text-cyan-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{language === 'cn' ? '二、双重/多维核验类型' : 'II. Multi-Agent Verification Channels'}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', labelCn: '全部核验渠道 (All Channels)', labelEn: 'All Verifications' },
                  { value: 'video', labelCn: '远程视频实景核验 (Video)', labelEn: 'Remote Video Audit' },
                  { value: 'registry', labelCn: '商事工商档案核验 (Registry)', labelEn: 'Registry Cross-Match' },
                  { value: 'customs', labelCn: '海关通关出货核验 (Customs)', labelEn: 'Customs Ledger Proof' },
                  { value: 'cross', labelCn: '多重资质交叉校对 (Cross)', labelEn: 'Multi-Cert Verification' }
                ].map((vt) => (
                  <button
                    key={vt.value}
                    onClick={() => {
                      setSelectedMarketVerification(vt.value);
                      setMarketPage(1); // Reset page on filter toggle
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      selectedMarketVerification === vt.value
                        ? 'bg-blue-500 border-blue-500 text-slate-100 font-bold shadow-md shadow-blue-950/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {language === 'cn' ? vt.labelCn : vt.labelEn}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* MERCHANT LISTING CONTAINER */}
          {isMarketLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
              {/* Requirement 1: Load interaction state display */}
              <span className="text-sm font-mono text-cyan-400 animate-pulse">
                {language === 'cn' ? '正在调取核验中心数据，请稍候' : 'Retrieving data from verification center, please wait...'}
              </span>
            </div>
          ) : marketFetchError ? (
            <div className="py-16 text-center border border-rose-950/40 bg-rose-950/10 rounded-2xl text-rose-400 font-mono text-xs flex flex-col items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-rose-500" />
              {/* Requirement 1: Fetch failed fallback display */}
              <span>{marketFetchError}</span>
              <button
                onClick={() => {
                  setMarketPage(1);
                  setIsMarketLoading(true);
                  setMarketFetchError(null);
                  fetchMarketMerchants({
                    market: marketRoute,
                    industry: selectedMarketIndustry,
                    verificationType: selectedMarketVerification,
                    page: 1,
                    size: marketPageSize
                  }).then((res) => {
                    setMarketMerchants(res.data);
                    setMarketTotal(res.total);
                    setIsMarketLoading(false);
                  }).catch(() => {
                    setMarketFetchError(language === 'cn' ? "暂时无法加载工厂档案，请稍后重试" : "Unable to load factory archives at the moment, please try again later.");
                    setIsMarketLoading(false);
                  });
                }}
                className="mt-2 px-3.5 py-1.5 rounded-lg bg-rose-900/30 hover:bg-rose-900/50 border border-rose-800 text-slate-100 transition-colors font-mono cursor-pointer"
              >
                {language === 'cn' ? '重新尝试加载' : 'Retry Loading'}
              </button>
            </div>
          ) : marketMerchants.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marketMerchants.map((merchant) => (
                  <div 
                    key={merchant.id}
                    onClick={() => {
                      window.history.pushState(null, '', `/factory/${merchant.id}`);
                      setFactoryRouteId(merchant.id);
                      setMarketRoute(null);
                    }}
                    className="bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/10 group relative overflow-hidden cursor-pointer"
                  >
                    {/* Hover visual accent */}
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>

                    <div>
                      {/* Header: Name, industry category tag */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                            {language === 'cn' ? merchant.nameCn : merchant.nameEn}
                          </h3>
                          {/* 1. 所属产业品类 label */}
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
                            <Layers className="h-3 w-3" />
                            <span>
                              {merchant.industry === 'machinery' ? (language === 'cn' ? '机电装配' : 'Mechatronics') :
                               merchant.industry === 'hardware' ? (language === 'cn' ? '五金建材' : 'Hardware') :
                               merchant.industry === 'textile' ? (language === 'cn' ? '纺织产业' : 'Textile') :
                               merchant.industry === 'chemical' ? (language === 'cn' ? '绿色化工' : 'Chemical') :
                               merchant.industry === 'pharma' ? (language === 'cn' ? '原料制药' : 'Pharma') :
                               merchant.industry === 'electronics' ? (language === 'cn' ? '电子元件' : 'Electronics') :
                               merchant.industry.toUpperCase()}
                            </span>
                          </span>
                        </div>
                        <div className="text-right font-mono text-xs">
                          <span className="text-slate-500">{language === 'cn' ? '信誉度' : 'Score'}:</span>
                          <span className="text-emerald-400 font-bold ml-1.5">{merchant.trustScore}</span>
                        </div>
                      </div>

                      {/* 2. 完整工厂注册地址 */}
                      <div className="text-xs text-slate-400 mb-4 bg-slate-950/50 p-3 rounded-lg border border-slate-900 font-mono">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">{language === 'cn' ? '🏭 完整工厂注册地址' : '🏭 Registered Factory Address'}</span>
                        <span className="block leading-relaxed">
                          {language === 'cn' ? merchant.addressCn : merchant.addressEn}
                        </span>
                      </div>

                      {/* 3. 核验类型标签 */}
                      <div className="mb-6">
                        <span className="text-slate-500 block text-[10px] font-mono uppercase font-bold mb-2">{language === 'cn' ? '核验机制及标签' : 'Verification Mechanism'}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {merchant.verificationTypes.includes('video') && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-900/60 font-medium">
                              {language === 'cn' ? '远程视频核验' : 'Remote Video Verified'}
                            </span>
                          )}
                          {merchant.verificationTypes.includes('registry') && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/60 font-medium">
                              {language === 'cn' ? '商事登记核验' : 'Registry Verified'}
                            </span>
                          )}
                          {merchant.verificationTypes.includes('customs') && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-900/60 font-medium">
                              {language === 'cn' ? '海关单据核验' : 'Customs Ledger Verified'}
                            </span>
                          )}
                          {merchant.verificationTypes.includes('cross') && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/60 font-medium">
                              {language === 'cn' ? '多维资质交叉核验' : 'Cross-Match Verified'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 4. 对应的核验档案及原始单据详情入口 */}
                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-[10px] text-slate-500 font-mono">
                        Est. {merchant.establishedYear} // Output: {merchant.certifiedOutput}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Requirement 3: Factory detailed modal trigger button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMerchantForDetail(merchant);
                          }}
                          className="px-3 py-2 bg-slate-950 hover:bg-slate-900 text-xs font-mono font-bold text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-slate-700 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow"
                          title={language === 'cn' ? '调阅海关、执照和视频单据' : 'View license, customs receipts, and video streams'}
                        >
                          <FileText className="h-3.5 w-3.5 text-cyan-400" />
                          <span>{language === 'cn' ? '原始单据' : 'Credentials'}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMerchantForDossier(merchant);
                          }}
                          className="px-3.5 py-2 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 hover:from-cyan-950 hover:to-blue-950 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 border border-cyan-800/40 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>{language === 'cn' ? '核验日志' : 'Logs'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Requirement 2: Dynamic pagination component */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs font-mono">
                <div className="text-slate-500">
                  {language === 'cn' 
                    ? `共 ${marketTotal} 家工厂 | 当前第 ${marketPage} 页 / 共 ${Math.ceil(marketTotal / marketPageSize) || 1} 页` 
                    : `Total ${marketTotal} factories | Page ${marketPage} of ${Math.ceil(marketTotal / marketPageSize) || 1}`}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={marketPage === 1}
                    onClick={() => {
                      setMarketPage(prev => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 disabled:opacity-30 disabled:hover:text-slate-300 disabled:hover:border-slate-800 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {language === 'cn' ? '上一页' : 'Previous'}
                  </button>
                  {Array.from({ length: Math.ceil(marketTotal / marketPageSize) || 1 }).map((_, idx) => {
                    const pNum = idx + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => {
                          setMarketPage(pNum);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className={`h-8 w-8 rounded flex items-center justify-center border font-bold transition-all cursor-pointer ${
                          marketPage === pNum
                            ? 'bg-cyan-500 border-cyan-500 text-slate-950 shadow-md shadow-cyan-950/30'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={marketPage >= Math.ceil(marketTotal / marketPageSize)}
                    onClick={() => {
                      setMarketPage(prev => Math.min(prev + 1, Math.ceil(marketTotal / marketPageSize)));
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 disabled:opacity-30 disabled:hover:text-slate-300 disabled:hover:border-slate-800 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {language === 'cn' ? '下一页' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-slate-800 rounded-3xl text-slate-400 font-mono text-xs flex flex-col items-center justify-center gap-2">
              {/* Requirement 5: Empty filter combination display fallback */}
              <ShieldCheck className="h-5 w-5 text-slate-600" />
              <span>
                {language === 'cn' ? '该类目暂无完成核验的工厂' : 'No verified factories currently match this category.'}
              </span>
            </div>
          )}

          {/* Quick matchmaking shortcut banner */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200">{language === 'cn' ? '未找到符合精确规格的源头工厂？' : 'Didn\'t find your exact specification?'}</h4>
              <p className="text-xs text-slate-400 mt-1">{language === 'cn' ? '提交您的特定外贸供需对标规格，系统将指派自研多 Agent 子程序抓取特定区域，并在 D1 进行闭环探访建档。' : 'Submit your customized target specifications. Our active multi-agent crawlers will scrape and commit to database.'}</p>
            </div>
            <button
              onClick={() => {
                const element = document.getElementById('matchmaking');
                if (element) {
                  navigateBack();
                  setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 200);
                }
              }}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono rounded-lg transition-colors cursor-pointer text-center"
            >
              {language === 'cn' ? '提交定制供需对接 &rarr;' : 'Submit Matchmaking Request &rarr;'}
            </button>
          </div>

        </section>
      ) : activeSection === 'suppliers' ? (
        /* ========================================================== */
        /* SECONDARY INDEPENDENT PAGE: VERIFIED SUPPLIERS DIRECTORY   */
        /* ========================================================== */
        <section id="suppliers" className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
          
          {/* Top Title Section */}
          <div className="mb-12 text-center md:text-left border-b border-slate-900 pb-8 relative">
            <div className="absolute top-0 right-0 hidden md:flex items-center gap-2 text-xs font-mono text-slate-500">
              <Database className="h-4 w-4 text-cyan-400" />
              <span>D1 LIVE SYNCHRONIZED</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100 flex items-center justify-center md:justify-start gap-3">
              <ShieldCheck className="h-8 w-8 text-cyan-400" />
              <span>{language === 'cn' ? '衡信·已核验商家库' : 'Hengxin Verified Merchant Library'}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-3 max-w-3xl leading-relaxed">
              {language === 'cn' 
                ? '展示通过严苛物理探访、官方司法和数据交叉校验的多维核验库。所有商家底层信息均有存证、防篡改。' 
                : 'Showcasing verified exporters backed by on-site physical inspection, corporate record integration, and double signature. All credentials persistently locked in cloud state.'}
            </p>
          </div>

          {/* Filtering Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10 bg-slate-900/40 p-6 rounded-2xl border border-slate-900 backdrop-blur">
            <div className="md:col-span-5">
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-2">{language === 'cn' ? '检索已核验商家名称' : 'Search by Name'}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                  <Search className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder={language === 'cn' ? '检索商家或主营产品关键词...' : 'Search company, industry or products...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-2">{language === 'cn' ? '核心运营区域筛选' : 'Filter by Region'}</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono cursor-pointer focus:border-cyan-500 focus:outline-none transition-colors"
              >
                <option value="all">{language === 'cn' ? '全部运营区域 (All Regions)' : 'All Regions'}</option>
                <option value="sea">东南亚 (SEA)</option>
                <option value="africa">非洲 (AFRICA)</option>
                <option value="india">印度 (INDIA)</option>
                <option value="iran">伊朗 (IRAN)</option>
                {showEU && <option value="eu">欧盟储备区 (EU)</option>}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-2">{language === 'cn' ? '全实力行业筛选' : 'Filter by Industry'}</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono cursor-pointer focus:border-cyan-500 focus:outline-none transition-colors"
              >
                <option value="all">{language === 'cn' ? '全部实力行业 (All Industries)' : 'All Industries'}</option>
                <option value="machinery">{language === 'cn' ? '机械制造 (Machinery)' : 'Machinery'}</option>
                <option value="energy">{language === 'cn' ? '新能源 (New Energy)' : 'New Energy'}</option>
                <option value="textile">{language === 'cn' ? '服装纺织 (Textile)' : 'Textile'}</option>
                <option value="electronics">{language === 'cn' ? '电子物联网 (Electronics)' : 'Electronics'}</option>
              </select>
            </div>

            <div className="md:col-span-1 flex items-end">
              <button
                onClick={() => setActiveSection('hero')}
                className="w-full py-2.5 flex items-center justify-center text-xs font-mono bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800 transition-all cursor-pointer"
                title={language === 'cn' ? '返回首页' : 'Back to Home'}
              >
                <ExternalLink className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </div>

          {/* Supplier Grid list */}
          <div className="grid grid-cols-1 gap-6">
            {filteredSuppliers.map((supplier) => {
              const isExpanded = expandedSupplierId === supplier.id;
              const detail = getSupplierDetailedData(supplier);
              
              return (
                <div 
                  key={supplier.id}
                  className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isExpanded 
                      ? 'border-cyan-500/80 shadow-lg shadow-cyan-950/20' 
                      : 'border-slate-800 hover:border-slate-700 hover:shadow-md'
                  }`}
                >
                  <div 
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedSupplierId(null);
                      } else {
                        setExpandedSupplierId(supplier.id);
                        setActivePlateTab('field');
                      }
                    }}
                    className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-850/40 transition-colors select-none"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded">
                          {supplier.region.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-widest bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
                          {language === 'cn' ? supplier.industryTextCn : supplier.industryTextEn}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {language === 'cn' ? `建厂年份: ${supplier.establishedYear}` : `Est. Year: ${supplier.establishedYear}`}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
                        {language === 'cn' ? supplier.nameCn : supplier.nameEn}
                        {supplier.registryVerified && (
                          <ShieldCheck className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                        )}
                      </h3>

                      <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                        {language === 'cn' ? supplier.descriptionCn : supplier.descriptionEn}
                      </p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800/60">
                      <div className="text-left md:text-right">
                        <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">{language === 'cn' ? '信誉评分' : 'TRUST SCORE'}</span>
                        <span className="text-2xl font-black text-cyan-400 tracking-tight">
                          {supplier.trustScore}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className={`h-9 px-4 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                            isExpanded
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                              : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span>{isExpanded ? (language === 'cn' ? '收起详情' : 'COLLAPSE') : (language === 'cn' ? '深度核验报告' : 'EXPAND DOSSIER')}</span>
                          <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-800 bg-slate-950/60 p-6 space-y-6">
                      
                      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 border border-slate-900 rounded-xl overflow-x-auto">
                        <button
                          onClick={() => setActivePlateTab('field')}
                          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer ${
                            activePlateTab === 'field'
                              ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Camera className="h-3.5 w-3.5" />
                          <span>{language === 'cn' ? '板块① 实地实景探访' : 'Plate ① On-Site Audit'}</span>
                        </button>

                        <button
                          onClick={() => setActivePlateTab('registry')}
                          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer ${
                            activePlateTab === 'registry'
                              ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{language === 'cn' ? '板块② 官方征信交叉' : 'Plate ② Registry Check'}</span>
                        </button>

                        <button
                          onClick={() => setActivePlateTab('social')}
                          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer ${
                            activePlateTab === 'social'
                              ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>{language === 'cn' ? '板块③ 企业社交验证' : 'Plate ③ Social Profile'}</span>
                        </button>

                        <button
                          onClick={() => setActivePlateTab('credentials')}
                          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer ${
                            activePlateTab === 'credentials'
                              ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Award className="h-3.5 w-3.5" />
                          <span>{language === 'cn' ? '板块④ 资质证书核验' : 'Plate ④ Certificates'}</span>
                        </button>
                      </div>

                      {activePlateTab === 'field' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-5 space-y-3">
                            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                              <span>LIVE INSPECTION LOG</span>
                              <span className="text-cyan-400 animate-pulse font-bold">REC ● VERICRED</span>
                            </div>

                            <div className="aspect-video w-full rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden relative flex flex-col justify-between p-4">
                              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20"></div>

                              {isPlayingSimVideo === supplier.id ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-center p-4">
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                                    <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">{language === 'cn' ? '监控实机播放中' : 'STREAMING INTERIOR'}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 font-mono line-clamp-2 max-w-xs">
                                    {detail.field.videoTitle}
                                  </p>
                                  
                                  <div className="flex items-end gap-1 h-8 mt-4">
                                    <span className="w-1 bg-cyan-400 h-3 animate-pulse"></span>
                                    <span className="w-1 bg-cyan-400 h-6 animate-pulse"></span>
                                    <span className="w-1 bg-cyan-400 h-4 animate-pulse"></span>
                                    <span className="w-1 bg-cyan-400 h-7 animate-pulse"></span>
                                    <span className="w-1 bg-cyan-400 h-2 animate-pulse"></span>
                                  </div>

                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsPlayingSimVideo(null);
                                    }}
                                    className="mt-4 px-3 py-1 rounded bg-red-950 border border-red-800 text-red-400 hover:text-red-300 text-[10px] font-mono cursor-pointer"
                                  >
                                    PAUSE STREAM
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex justify-between items-start z-10">
                                    <span className="text-[9px] font-mono bg-slate-900/80 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                                      CAM_01_WORKSHOP
                                    </span>
                                    <span className="text-[9px] font-mono bg-slate-900/80 border border-slate-800 px-1.5 py-0.5 rounded text-cyan-400">
                                      {detail.field.videoDuration}
                                    </span>
                                  </div>

                                  <button 
                                    onClick={() => setIsPlayingSimVideo(supplier.id)}
                                    className="self-center h-12 w-12 rounded-full bg-cyan-950/80 hover:bg-cyan-900 text-cyan-400 flex items-center justify-center border border-cyan-800 shadow-lg shadow-cyan-950/50 hover:scale-105 transition-all cursor-pointer z-10"
                                  >
                                    <Play className="h-5 w-5 fill-cyan-400 translate-x-0.5" />
                                  </button>

                                  <div className="z-10 bg-slate-900/80 border border-slate-800/80 p-2 rounded-lg">
                                    <p className="text-[10px] font-mono text-slate-300 font-bold truncate">
                                      {detail.field.videoTitle}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                              <div>
                                <span>核验专员: </span>
                                <span className="text-slate-300 font-bold">{detail.field.auditor}</span>
                              </div>
                              <div>
                                <span>走访时间: </span>
                                <span className="text-slate-300 font-bold">{detail.field.auditDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="lg:col-span-4 space-y-3">
                            <span className="block text-xs font-mono text-slate-500 uppercase">OFFICIAL INSPECTION SNAPSHOTS</span>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {detail.field.photos.map((photo: any, index: number) => (
                                <div 
                                  key={index}
                                  onClick={() => setPreviewCert({ title: photo.title, certNo: `PHOTO-${supplier.id.toUpperCase()}-${index + 1}`, type: photo.desc })}
                                  className="group relative aspect-square rounded-xl bg-slate-950 border border-slate-800 overflow-hidden cursor-pointer hover:border-cyan-500/50 transition-colors"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
                                  <div className="absolute inset-0 flex flex-col justify-between p-2 z-20">
                                    <span className="text-[8px] font-mono text-slate-500 bg-slate-900/80 px-1 py-0.5 rounded self-start">
                                      REG_IMG_{index + 1}
                                    </span>
                                    <div>
                                      <span className="block text-[9px] font-mono text-slate-200 font-bold leading-tight truncate group-hover:text-cyan-400">
                                        {photo.title}
                                      </span>
                                      <span className="text-[8px] font-mono text-slate-500">
                                        {photo.desc}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="absolute inset-0 bg-cyan-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-30">
                                    <Eye className="h-5 w-5 text-cyan-400" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="lg:col-span-3 bg-slate-900/40 border border-slate-900 p-4 rounded-xl flex flex-col justify-between">
                            <div className="space-y-3">
                              <span className="block text-xs font-mono text-slate-500 uppercase">PHYSICAL DISPATCH SUMMARY</span>
                              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                {detail.field.commentsCn}
                              </p>
                              <p className="text-[10px] text-slate-500 leading-relaxed font-mono italic">
                                {detail.field.commentsEn}
                              </p>
                            </div>
                            <div className="pt-4 border-t border-slate-900 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>现场经营要素全部核验通过</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activePlateTab === 'registry' && (
                        <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
                          <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
                            <span className="text-xs font-mono text-slate-500">GOVERNMENT & CREDIT CROSS-REFERENCE ENGINE</span>
                            <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-mono font-bold">D1 ACTIVE CONSOLE</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800/40 space-y-1">
                              <span className="block text-[9px] font-mono text-slate-500 uppercase">{language === 'cn' ? '官方登记与投资公示主管机构' : 'Registry Authority'}</span>
                              <span className="block text-xs font-bold text-slate-200">{detail.registry.authority}</span>
                            </div>

                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800/40 space-y-1">
                              <span className="block text-[9px] font-mono text-slate-500 uppercase">{language === 'cn' ? '工商执照与公司注册编号' : 'Registration Number'}</span>
                              <span className="block text-xs font-mono font-bold text-slate-200">{detail.registry.regNo}</span>
                            </div>

                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800/40 space-y-1">
                              <span className="block text-[9px] font-mono text-slate-500 uppercase">{language === 'cn' ? '主体存续经营状态' : 'Entity Status'}</span>
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{detail.registry.status}</span>
                              </div>
                            </div>

                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800/40 space-y-1">
                              <span className="block text-[9px] font-mono text-slate-500 uppercase">{language === 'cn' ? '实缴或授权本金规模' : 'Authorized Capital'}</span>
                              <span className="block text-xs font-mono font-bold text-slate-200">{detail.registry.capital}</span>
                            </div>

                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800/40 space-y-1">
                              <span className="block text-[9px] font-mono text-slate-500 uppercase">{language === 'cn' ? '在审诉讼纠纷记录' : 'Litigation & Legal Record'}</span>
                              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                                <ShieldCheck className="h-4 w-4" />
                                <span>{detail.registry.litigation}</span>
                              </div>
                            </div>

                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800/40 space-y-1">
                              <span className="block text-[9px] font-mono text-slate-500 uppercase">{language === 'cn' ? '国家税务完税信用评级' : 'Tax Rating'}</span>
                              <span className="block text-xs font-bold text-slate-200">{detail.registry.taxRating}</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-900/80 text-[10px] font-mono text-slate-500">
                            {language === 'cn' 
                              ? '信息核对渠道：自动对接海外企业信用等级注册数据库与海关总署。多维度相互校验，排除空壳及挂靠风险。' 
                              : 'Registry validation channel: BKPM API, Nigeria CAC database registry and State Bank APIs integrated. 100% verified.'}
                          </div>
                        </div>
                      )}

                      {activePlateTab === 'social' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-5 space-y-3">
                            <span className="block text-xs font-mono text-slate-500 uppercase">ACTIVE BUSINESS PLATFORMS</span>
                            
                            <div className="space-y-2">
                              {detail.social.platforms.map((platform: any, index: number) => (
                                <div 
                                  key={index}
                                  className="p-3 bg-slate-900 rounded-xl border border-slate-800/60 flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-slate-950 flex items-center justify-center text-cyan-400 border border-slate-800">
                                      <MessageSquare className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <span className="block text-xs font-bold text-slate-200">{platform.name}</span>
                                      <span className="text-[10px] text-slate-500 font-mono">{platform.link}</span>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <span className="block text-[10px] font-bold text-cyan-400">{platform.count}</span>
                                    <span className="text-[9px] font-mono text-emerald-400">{platform.status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                              <span className="text-xs font-mono text-slate-500">RECENT BRAND ACTIVITY STREAM (D1 VERIFIED FEED)</span>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                            </div>

                            <div className="space-y-4">
                              {detail.social.postsCn.map((post: string, index: number) => (
                                <div key={index} className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-2">
                                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-600">
                                    <span>FEED_STAMP_{index + 1}</span>
                                    <span>STABLE TIMELINE</span>
                                  </div>
                                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                                    {post}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-mono italic">
                                    {detail.social.postsEn[index]}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activePlateTab === 'credentials' && (
                        <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
                          <span className="block text-xs font-mono text-slate-500 mb-4 uppercase">D1 PERSISTED CRYPTO-SECURED CREDENTIAL DATABASE</span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {detail.credentials.map((cred: any, index: number) => (
                              <div 
                                key={index}
                                className="p-4 bg-slate-900 rounded-xl border border-slate-800/60 flex items-center justify-between hover:border-slate-700 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-slate-950 flex items-center justify-center text-cyan-400 border border-slate-800">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <span className="block text-xs font-bold text-slate-200">{cred.name}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">{cred.type}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => setPreviewCert({ title: cred.name, certNo: cred.certNo, type: cred.type })}
                                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 text-cyan-400 hover:text-cyan-300 text-xs font-mono border border-slate-800 transition-colors cursor-pointer"
                                >
                                  VIEW CERT
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 p-4 rounded-xl border border-blue-950 bg-blue-950/10 text-[10px] font-mono text-slate-500 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-cyan-500" />
                            <span>
                              {language === 'cn' 
                                ? '数字签名校验系统：所有存储 of paper-based qualifications are scanned directly from originals by VeriCred specialists. Secured by tamper-proof cryptographic hashes.' 
                                : 'Digital Signature system active: Credentials are physically scanned by regional offices in Jakarta, Lagos & Pune. Backed by tamper-proof blockchain-style records.'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="pt-6 border-t border-slate-900 flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setSelectedSupplierForContact(supplier);
                            setContactSubmitted(false);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="h-4 w-4" />
                          <span>{language === 'cn' ? '一键对接此实力商家' : 'Fast-Track Contact'}</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}

            {filteredSuppliers.length === 0 && (
              <div className="py-20 text-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-3xl">
                {language === 'cn' ? '没有符合筛选要求的已核验实力商家记录' : 'No verified merchants matched the specified filters.'}
              </div>
            )}
          </div>

        </section>
      ) : (
        /* ========================================================== */
        /* PRIMARY HOME PAGE LAYOUT: HERO, REGIONS, AGENT, MATCHMAKING*/
        /* ========================================================== */
        <>
          {/* 1. HERO SECTION */}
          <section id="hero" className="relative py-16 md:py-24 border-b border-slate-900 overflow-hidden">
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto">
                
                {/* Replay Intro Trigger Badge */}
                <button
                  onClick={onShowIntro}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 hover:text-cyan-300 text-xs font-mono mb-6 transition-all shadow hover:shadow-cyan-500/10 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>{language === 'cn' ? '重新播放开屏握手动画' : 'Replay Handshake Intro'}</span>
                </button>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-100 mb-6">
                  {t.heroTitle}
                </h1>
                <p className="text-lg md:text-xl text-cyan-400 font-semibold mb-6">
                  {t.heroSubtitle}
                </p>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
                  {t.heroIntro}
                </p>

                {/* Direct Platform Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-900 backdrop-blur-sm">
                  <div className="p-3 text-center">
                    <span className="block text-2xl font-extrabold text-cyan-400">100%</span>
                    <span className="text-[11px] text-slate-500 font-mono tracking-wider">
                      {language === 'cn' ? '纯人工先审备案' : 'Manual Initial Audit'}
                    </span>
                  </div>
                  <div className="p-3 text-center border-l border-slate-800">
                    <span className="block text-2xl font-extrabold text-cyan-400">D1 Serverless</span>
                    <span className="text-[11px] text-slate-500 font-mono tracking-wider">
                      {language === 'cn' ? 'CF 数据湖引擎' : 'CF Database Engine'}
                    </span>
                  </div>
                  <div className="p-3 text-center border-l border-slate-800">
                    <span className="block text-2xl font-extrabold text-cyan-400">Zero %</span>
                    <span className="text-[11px] text-slate-500 font-mono tracking-wider">
                      {language === 'cn' ? '平台佣金提成' : 'Transaction Commission'}
                    </span>
                  </div>
                  <div className="p-3 text-center border-l border-slate-800">
                    <span className="block text-2xl font-extrabold text-cyan-400">4 Regions</span>
                    <span className="text-[11px] text-slate-500 font-mono tracking-wider">
                      {language === 'cn' ? '核心运营板块' : 'Core Focus Segments'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Core Values Bento Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                
                <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-all flex flex-col justify-between">
                  <div>
                    <div className="h-10 w-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mb-2">{t.heroValue1Title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{t.heroValue1Desc}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono mt-4">VERIFICATION // CLOUDFLARE_R2</span>
                </div>

                <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-all flex flex-col justify-between">
                  <div>
                    <div className="h-10 w-10 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 mb-4">
                      <Globe className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mb-2">{t.heroValue2Title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{t.heroValue2Desc}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono mt-4">NEUTRALITY // ZERO_TRANSACTIONS</span>
                </div>

                <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-all flex flex-col justify-between">
                  <div>
                    <div className="h-10 w-10 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 mb-4">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mb-2">{t.heroValue3Title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{t.heroValue3Desc}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono mt-4">AUTOMATION // MULTI_AGENT_D1</span>
                </div>

              </div>

            </div>
          </section>

          {/* 2. REGIONS SECTION (Requirement 3: Dropdown setup & core regions display) */}
          <section id="regions" className="py-16 border-b border-slate-900 bg-slate-950/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-100">{t.regionsTitle}</h2>
                <p className="text-xs md:text-sm text-slate-400 mt-2">{t.regionsSubtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                
                {/* China Industry Source Base Card */}
                <div 
                  onClick={() => navigateToMarket('china')}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800/60 hover:border-cyan-500/80 hover:shadow-lg hover:shadow-cyan-950/20 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="absolute top-0 right-0 p-3 bg-red-950/50 text-red-400 rounded-bl-lg text-xs font-mono font-bold">
                      CHINA
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 mb-2 mt-2 group-hover:text-cyan-400 transition-colors">
                      {language === 'cn' ? '中国产业源头基地' : 'China Industry Source Base'}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {language === 'cn' 
                        ? '汇集国内源头生产工厂，全部完成工商档案备案核验，支持远程视频现场核验厂区实景，结合商事登记信息、海关出货单据做多维度交叉核验。'
                        : 'Gathers domestic source manufacturing factories, all verified via corporate archives and registries. Supports remote video real-scene on-site verification, cross-checked with commercial registration info and customs shipping records.'}
                    </p>
                  </div>
                  <div>
                    <div className="pt-3 border-t border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>{language === 'cn' ? '已核验商家数' : 'Verified Exporters'}:</span>
                        <span className="text-cyan-400 font-bold">350+</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'cn' ? '区域信任指数' : 'Trust Index'}:</span>
                        <span className="text-emerald-400 font-bold">99.8%</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 text-[10px] font-mono text-cyan-400/60 group-hover:text-cyan-400 flex items-center justify-between transition-colors">
                      <span>{language === 'cn' ? '进入产业基地' : 'Enter Base'}</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                </div>

                {/* SEA Region */}
                <div 
                  onClick={() => navigateToMarket('southeast')}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800/60 hover:border-cyan-500/80 hover:shadow-lg hover:shadow-cyan-950/20 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="absolute top-0 right-0 p-3 bg-cyan-950/50 text-cyan-400 rounded-bl-lg text-xs font-mono font-bold">
                      SEA
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 mb-2 mt-2 group-hover:text-cyan-400 transition-colors">{t.regionSEA}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{t.regionDescSEA}</p>
                  </div>
                  <div>
                    <div className="pt-3 border-t border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>{t.regionVerifiedCount}:</span>
                        <span className="text-cyan-400 font-bold">142</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.regionTrustLevel}:</span>
                        <span className="text-emerald-400 font-bold">98.4%</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 text-[10px] font-mono text-cyan-400/60 group-hover:text-cyan-400 flex items-center justify-between transition-colors">
                      <span>{language === 'cn' ? '进入海外专区' : 'Enter Market'}</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                </div>

                {/* Africa Region */}
                <div 
                  onClick={() => navigateToMarket('africa')}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800/60 hover:border-cyan-500/80 hover:shadow-lg hover:shadow-cyan-950/20 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="absolute top-0 right-0 p-3 bg-sky-950/50 text-sky-400 rounded-bl-lg text-xs font-mono font-bold">
                      AFRICA
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 mb-2 mt-2 group-hover:text-cyan-400 transition-colors">{t.regionAfrica}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{t.regionDescAfrica}</p>
                  </div>
                  <div>
                    <div className="pt-3 border-t border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>{t.regionVerifiedCount}:</span>
                        <span className="text-cyan-400 font-bold">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.regionTrustLevel}:</span>
                        <span className="text-emerald-400 font-bold">92.1%</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 text-[10px] font-mono text-cyan-400/60 group-hover:text-cyan-400 flex items-center justify-between transition-colors">
                      <span>{language === 'cn' ? '进入海外专区' : 'Enter Market'}</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                </div>

                {/* India Region */}
                <div 
                  onClick={() => navigateToMarket('india')}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800/60 hover:border-cyan-500/80 hover:shadow-lg hover:shadow-cyan-950/20 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="absolute top-0 right-0 p-3 bg-blue-950/50 text-blue-400 rounded-bl-lg text-xs font-mono font-bold">
                      INDIA
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 mb-2 mt-2 group-hover:text-cyan-400 transition-colors">{t.regionIndia}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{t.regionDescIndia}</p>
                  </div>
                  <div>
                    <div className="pt-3 border-t border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>{t.regionVerifiedCount}:</span>
                        <span className="text-cyan-400 font-bold">116</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.regionTrustLevel}:</span>
                        <span className="text-emerald-400 font-bold">95.8%</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 text-[10px] font-mono text-cyan-400/60 group-hover:text-cyan-400 flex items-center justify-between transition-colors">
                      <span>{language === 'cn' ? '进入海外专区' : 'Enter Market'}</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                </div>

                {/* Iran Region */}
                <div 
                  onClick={() => navigateToMarket('iran')}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800/60 hover:border-cyan-500/80 hover:shadow-lg hover:shadow-cyan-950/20 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="absolute top-0 right-0 p-3 bg-indigo-950/50 text-indigo-400 rounded-bl-lg text-xs font-mono font-bold">
                      IRAN
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 mb-2 mt-2 group-hover:text-cyan-400 transition-colors">{t.regionIran}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{t.regionDescIran}</p>
                  </div>
                  <div>
                    <div className="pt-3 border-t border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>{t.regionVerifiedCount}:</span>
                        <span className="text-cyan-400 font-bold">64</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.regionTrustLevel}:</span>
                        <span className="text-amber-400 font-bold">90.2%</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 text-[10px] font-mono text-cyan-400/60 group-hover:text-cyan-400 flex items-center justify-between transition-colors">
                      <span>{language === 'cn' ? '进入海外专区' : 'Enter Market'}</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* EU Collapsible Optional Zone (Requirement 3: EU is set as collapsible optional) */}
              <div className="mt-6 border border-slate-800/60 bg-slate-900/30 rounded-xl">
                <button
                  onClick={() => {
                    setShowEU(!showEU);
                    // Also automatically show EU suppliers in lists if opened
                  }}
                  className="w-full flex items-center justify-between p-4 text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span>{t.regionEU} - {language === 'cn' ? '点击展开/折叠次要备选区域与核验名单' : 'Click to Toggle Secondary EU Admission Sector'}</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-400 font-bold">
                    {showEU ? (language === 'cn' ? '已展示' : 'SHOWING') : (language === 'cn' ? '已收起' : 'COLLAPSED')}
                  </span>
                </button>

                {showEU && (
                  <div className="p-5 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/40 space-y-4">
                    <p className="leading-relaxed">
                      {language === 'cn'
                        ? '欧盟作为次要备选区域，本平台不主动在外方抓取其本地商家。仅针对主动在平台申请入驻并符合严苛欧盟准入CE标准、合规完税凭证齐全的优质外贸实体企业，通过多Agent清洗录入展示。'
                        : 'The EU acts as a secondary reserve zone. We do not crawl European firms. Only outstanding exporters who voluntarily apply and pass strict CE certification standards will have their enterprise credentials uploaded and validated in D1 database.'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-[11px] text-slate-300">
                      <div className="p-3 rounded bg-slate-900 border border-slate-800">
                        <span className="block text-slate-500">欧盟主动入驻标准 / EU Admission criteria</span>
                        <span className="text-cyan-400 font-bold">CE / RoHS / Reach Verification</span>
                      </div>
                      <div className="p-3 rounded bg-slate-900 border border-slate-800">
                        <span className="block text-slate-500">已核验欧盟商家 / Active EU Merchants</span>
                        <span className="text-cyan-400 font-bold">18 Businesses</span>
                      </div>
                      <div className="p-3 rounded bg-slate-900 border border-slate-800">
                        <span className="block text-slate-500">数据同步状态 / Sync Status</span>
                        <span className="text-emerald-400 font-bold">D1 SECURE ACTIVE</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Prompt 2 Requirement 2: Other Regions are completely hidden */}
              <div className="mt-4 p-4 rounded-xl border border-red-900/30 bg-red-950/10 text-xs text-slate-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <span>
                  {language === 'cn'
                    ? '除东南亚、非洲、印度、伊朗、欧盟外，其余全球地区主动关闭展示通道；平台货源主体以中国源头工厂为核心，面向上述海外市场做定向供需对接。'
                    : 'Except Southeast Asia, Africa, India, Iran, and the EU, all other global regions have been shut down; the platform focuses on Chinese source factories as the core, establishing directional supply-demand matching for these overseas markets.'}
                </span>
              </div>

            </div>
          </section>

          {/* 4. MULTI-AGENT SIMULATOR SANDBOX (Prompts 1 & 2 Background slots) */}
          <section id="agent" className="py-16 border-b border-slate-900 bg-slate-950/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Admin Backstage Control Panel (Requirement 1, 3, 4) */}
              {isAdminMode && (
                <div className="mb-12 p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/20 shadow-xl shadow-cyan-950/20 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-cyan-950 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                          <span>{language === 'cn' ? '自研多 Agent 运营后台' : 'VeriCred Multi-Agent Admin Console'}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/40 text-cyan-400 font-mono">BACKSTAGE</span>
                        </h3>
                        <p className="text-xs text-slate-400">{language === 'cn' ? '配置外部第三方核验API端点与运行高级多Agent采集爬虫' : 'Configure third-party API endpoints and dispatch advanced multi-agent crawling tasks'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-800">
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></div>
                      <span>{language === 'cn' ? 'D1 接口就绪 / D1_STUB_READY' : 'D1_STUB_READY'}</span>
                    </div>
                  </div>

                  {/* Two Column Control Area */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                    
                    {/* Column 1: API Config Module (Requirement 1) */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                        <Server className="h-3.5 w-3.5" />
                        <span>{language === 'cn' ? '1. 统一外部核验接口配置 (API Config)' : '1. Unified Verification API Config'}</span>
                      </h4>
                      
                      <div className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">
                            {language === 'cn' ? '工商信息查询接口 (Corporate Registry URL)' : 'Corporate Registry Query URL'}
                          </label>
                          <input
                            type="text"
                            value={corporateRegistryUrl}
                            onChange={(e) => setCorporateRegistryUrl(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-mono rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">
                            {language === 'cn' ? '社交媒体公开数据接口 (Social Media Data URL)' : 'Social Media Profile URL'}
                          </label>
                          <input
                            type="text"
                            value={socialMediaDataUrl}
                            onChange={(e) => setSocialMediaDataUrl(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-mono rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">
                            {language === 'cn' ? '海关单据核验接口 (Customs Document URL)' : 'Customs Document Verification URL'}
                          </label>
                          <input
                            type="text"
                            value={customsDocumentUrl}
                            onChange={(e) => setCustomsDocumentUrl(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-mono rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              saveApiConfig({
                                corporateRegistryUrl,
                                socialMediaDataUrl,
                                customsDocumentUrl
                              });
                              setApiConfigSaveSuccess(true);
                              setTimeout(() => setApiConfigSaveSuccess(false), 3000);
                            }}
                            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs rounded transition-colors cursor-pointer"
                          >
                            {language === 'cn' ? '保存接口配置' : 'Save Config'}
                          </button>
                          {apiConfigSaveSuccess && (
                            <span className="text-xs text-emerald-400 font-mono animate-pulse">
                              ✓ {language === 'cn' ? '接口路径修改已持久化保存！' : 'Saved to Local Storage!'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Advanced Scraping/Crawling Console (Requirement 4) */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5" />
                        <span>{language === 'cn' ? '2. 高级数据采集控制台 (Advanced Scraper)' : '2. Advanced Data Scraping Engine'}</span>
                      </h4>

                      <div className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono text-slate-400 mb-1">
                              {language === 'cn' ? '目标种子网站/关键词' : 'Target Seed URL / Keywords'}
                            </label>
                            <input
                              type="text"
                              value={crawlerUrl}
                              onChange={(e) => setCrawlerUrl(e.target.value)}
                              placeholder="e.g. https://vietnam-export.gov/firms"
                              className="w-full px-3 py-1.5 text-xs font-mono rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-slate-400 mb-1">
                              {language === 'cn' ? '计划拟定商家名称' : 'Drafted Merchant Name'}
                            </label>
                            <input
                              type="text"
                              value={scrapedMerchantName}
                              onChange={(e) => setScrapedMerchantName(e.target.value)}
                              placeholder={language === 'cn' ? '例如：越南海防德和精密五金厂' : 'e.g. Vietnam Dehe Hardware'}
                              className="w-full px-3 py-1.5 text-xs font-mono rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono text-slate-400 mb-1">
                              {language === 'cn' ? '爬取深度 (Depth)' : 'Crawl Depth'}
                            </label>
                            <select
                              value={crawlerDepth}
                              onChange={(e) => setCrawlerDepth(Number(e.target.value))}
                              className="w-full p-1.5 text-xs font-mono rounded bg-slate-900 border border-slate-800 text-slate-300"
                            >
                              <option value={1}>1 层 (Shallow)</option>
                              <option value={2}>2 层 (Normal)</option>
                              <option value={3}>3 层 (Deep)</option>
                              <option value={4}>4 层 (Brute Force)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-slate-400 mb-1">
                              {language === 'cn' ? '并发线程数 (Threads)' : 'Concurrency Threads'}
                            </label>
                            <select
                              value={crawlerThreads}
                              onChange={(e) => setCrawlerThreads(Number(e.target.value))}
                              className="w-full p-1.5 text-xs font-mono rounded bg-slate-900 border border-slate-800 text-slate-300"
                            >
                              <option value={2}>2 Threads</option>
                              <option value={4}>4 Threads</option>
                              <option value={8}>8 Threads (High Performance)</option>
                              <option value={16}>16 Threads (Proxy Rotation)</option>
                            </select>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleTriggerAdvancedScraper}
                            disabled={crawlerStatus === 'running'}
                            className={`w-full py-2 rounded text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
                              crawlerStatus === 'running'
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-slate-100 cursor-pointer'
                            }`}
                          >
                            <Play className="h-3.5 w-3.5" />
                            <span>{crawlerStatus === 'running' ? (language === 'cn' ? '高级采集Agent运行中...' : 'Crawling...') : (language === 'cn' ? '启动高级采集 & 多 Agent 闭环' : 'Run Advanced Scraper & Multi-Agent Close-loop')}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Log Terminal Display */}
                  {crawlerLogs.length > 0 && (
                    <div className="mt-6 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-1.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-900 text-slate-500 text-[10px]">
                        <span>VERICRED ADVANCED DISTRIBUTED CRAWLER SHELL V2.0 // STDOUT</span>
                        <span className="text-cyan-400 animate-pulse">● LIVE STREAM</span>
                      </div>
                      <div className="max-h-[160px] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                        {crawlerLogs.map((log, index) => (
                          <div key={index} className={`text-[11px] ${
                            log.includes('ERROR') ? 'text-rose-500' :
                            log.includes('SUCCESS') || log.includes('Commit') ? 'text-emerald-400' :
                            log.includes('[Plate') ? 'text-cyan-400 font-semibold' : 'text-slate-400'
                          }`}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Context & Description */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono border border-cyan-800">
                    AI COGNITIVE MULTI-AGENT SYSTEM
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">
                    {t.agentTitle}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.agentSubtitle}
                  </p>
                  
                  <div className="space-y-2 text-xs text-slate-400 bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
                      <span><strong>前期人工模式：</strong>人工手动录入并完成物理实地核对。</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
                      <span><strong>后期自研多 Agent 模式：</strong>无缝调用 Workers 自动获取工商、R2图片，规整直接写入 D1 SQL 数据库。</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Sandbox Simulator */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-xs font-mono text-slate-500 uppercase mb-4 pb-2 border-b border-slate-800">
                    VERICRED COGNITIVE INTERACTION CONSOLE // VERIFICATION_STAGE
                  </h3>

                  <form onSubmit={handleRunAgentVerification} className="space-y-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                          {language === 'cn' ? '待核验企业主体名称' : 'Target Enterprise Name'}
                        </label>
                        <input
                          id="agent-company-input"
                          type="text"
                          placeholder={language === 'cn' ? '例如：浙江信德机械制造有限公司' : 'e.g. Zhejiang Xinde Machinery Mfg.'}
                          value={agentCompany}
                          onChange={(e) => setAgentCompany(e.target.value)}
                          disabled={agentStatus !== 'idle' && agentStatus !== 'success'}
                          className="w-full px-3 py-2 text-xs rounded bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1.5">{language === 'cn' ? '出海核心区域' : 'Core Region'}</label>
                          <select
                            id="agent-region-select"
                            value={agentRegion}
                            onChange={(e: any) => setAgentRegion(e.target.value)}
                            disabled={agentStatus !== 'idle' && agentStatus !== 'success'}
                            className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
                          >
                            <option value="sea">东南亚 (SEA)</option>
                            <option value="africa">非洲 (AFRICA)</option>
                            <option value="india">印度 (INDIA)</option>
                            <option value="iran">伊朗 (IRAN)</option>
                            <option value="eu">欧盟 (EU)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1.5">{language === 'cn' ? '所属行业' : 'Industry'}</label>
                          <select
                            id="agent-industry-select"
                            value={agentIndustry}
                            onChange={(e: any) => setAgentIndustry(e.target.value)}
                            disabled={agentStatus !== 'idle' && agentStatus !== 'success'}
                            className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
                          >
                            <option value="machinery">{language === 'cn' ? '机械制造' : 'Machinery'}</option>
                            <option value="energy">{language === 'cn' ? '新能源' : 'New Energy'}</option>
                            <option value="textile">{language === 'cn' ? '服装纺织' : 'Textile'}</option>
                            <option value="electronics">{language === 'cn' ? '电子物联网' : 'Electronics'}</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Submit Simulator button */}
                    <button
                      id="agent-simulate-btn"
                      type="submit"
                      disabled={agentStatus !== 'idle' && agentStatus !== 'success'}
                      className={`w-full py-2.5 rounded text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        agentStatus !== 'idle' && agentStatus !== 'success'
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950'
                      }`}
                    >
                      <Cpu className="h-4 w-4" />
                      <span>{t.agentBtnSubmit}</span>
                    </button>

                  </form>

                  {/* Real-time Agent Pipeline Logger Display */}
                  <div className="mt-6 bg-slate-950 border border-slate-855 rounded-lg p-4 font-mono text-xs space-y-3 min-h-[140px] flex flex-col justify-center">
                    
                    {agentStatus === 'idle' && (
                      <p className="text-slate-500 text-center italic">{t.agentStatusIdle}</p>
                    )}

                    {agentStatus === 'step1' && (
                      <div className="space-y-2">
                        <p className="text-cyan-400 animate-pulse">{t.agentStatusStep1}</p>
                        <div className="h-1 w-full bg-slate-900 rounded overflow-hidden">
                          <div className="h-full bg-cyan-500 animate-[pulse_1s_infinite] w-1/4"></div>
                        </div>
                      </div>
                    )}

                    {agentStatus === 'step2' && (
                      <div className="space-y-2">
                        <p className="text-slate-500 text-xs">{t.agentStatusStep1}</p>
                        <p className="text-cyan-400 animate-pulse">{t.agentStatusStep2}</p>
                        <p className="text-[10px] text-slate-500">{t.agentDocCompany} | {t.agentDocType}</p>
                        <div className="h-1 w-full bg-slate-900 rounded overflow-hidden">
                          <div className="h-full bg-cyan-500 animate-[pulse_1s_infinite] w-2/4"></div>
                        </div>
                      </div>
                    )}

                    {agentStatus === 'step3' && (
                      <div className="space-y-2">
                        <p className="text-slate-600 text-xs">✓ {t.agentStatusStep1}</p>
                        <p className="text-slate-600 text-xs">✓ {t.agentStatusStep2}</p>
                        <p className="text-cyan-400 animate-pulse">{t.agentStatusStep3}</p>
                        <div className="h-1 w-full bg-slate-900 rounded overflow-hidden">
                          <div className="h-full bg-cyan-500 animate-[pulse_1s_infinite] w-3/4"></div>
                        </div>
                      </div>
                    )}

                    {agentStatus === 'step4' && (
                      <div className="space-y-2">
                        <p className="text-slate-600 text-xs">✓ {t.agentStatusStep1}</p>
                        <p className="text-slate-600 text-xs">✓ {t.agentStatusStep2}</p>
                        <p className="text-slate-600 text-xs">✓ {t.agentStatusStep3}</p>
                        <p className="text-cyan-400 animate-pulse">{t.agentStatusStep4}</p>
                        <div className="h-1 w-full bg-slate-900 rounded overflow-hidden">
                          <div className="h-full bg-cyan-500 animate-[pulse_1s_infinite] w-11/12"></div>
                        </div>
                      </div>
                    )}

                    {agentStatus === 'success' && (
                      <div className="space-y-3">
                        <p className="text-emerald-400 font-bold">{t.agentStatusSuccess}</p>
                        <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-900 text-[11px] text-slate-300">
                          <strong>D1 Commit Log Hash:</strong> d1_commit_ae8f0022_faith_sql <br />
                          <strong>R2 Media Pin:</strong> r2_bucket_assets/pdf/license_verify_ok.pdf <br />
                          <strong>Verified Status:</strong> 100% True Active.
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {language === 'cn' ? '* 该商家已被动态推入上述“实力商家信誉名录”，请滚动查看首位！' : '* The merchant has been prepended to the live directory card above! Go look!'}
                        </p>
                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>
          </section>

          {/* 5. MATCHMAKING HALL & WORKER ROUTING (Requirement 5) */}
          <section id="matchmaking" className="py-16 border-b border-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Live Feed queue */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-100">{t.matchTitle}</h2>
                    <p className="text-xs text-slate-400 mt-1">{t.matchSubtitle}</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-850 overflow-hidden">
                    
                    <div className="p-3 bg-slate-950/60 font-mono text-[11px] text-slate-400 flex justify-between items-center">
                      <span>{t.matchRecent}</span>
                      <span className="text-cyan-400 animate-pulse">● WORKER_ROUTING_LIVE</span>
                    </div>

                    {matchQueue.map((req) => (
                      <div key={req.id} className="p-4 hover:bg-slate-900/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-200">
                              {language === 'cn' ? req.sourceCn : req.sourceEn}
                            </span>
                            <span className="text-[9px] font-mono bg-slate-850 px-2 py-0.5 rounded text-slate-400">
                              → TO {req.targetRegion.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{req.timestamp}</span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {language === 'cn' ? req.requirementCn : req.requirementEn}
                        </p>

                        <div className="flex items-center justify-between mt-3 text-[10px] font-mono">
                          <span className="text-slate-500">REQUEST_ID: {req.id}</span>
                          <span className={`px-2 py-0.5 rounded ${
                            req.status === 'matched' 
                              ? 'bg-emerald-950 text-emerald-400' 
                              : req.status === 'verifying'
                              ? 'bg-cyan-950 text-cyan-400 animate-pulse'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {req.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

                {/* Custom request matchmaking form */}
                <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-400 mb-3">
                      <Send className="h-5 w-5" />
                      <span className="text-xs font-mono uppercase tracking-wider">Edge Worker Secure Dispatch</span>
                    </div>
                    
                    <h3 className="text-base font-extrabold text-slate-100 mb-2">
                      {language === 'cn' ? '提交您的实力核验/采购匹配需求' : 'Initiate Verification / Match Request'}
                    </h3>
                    
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {language === 'cn' 
                        ? '衡信不是电商平台，不插手货款。我们将派遣人工配合多Agent，代您核实对方公司的实地、完税及出口单据真伪，帮助建立初步信任链。'
                        : 'VeriCred is not a trading store. We help you cross-verify registration, bank credibility and physical factory existence.'}
                    </p>

                    <form onSubmit={handleCustomMatchmaking} className="space-y-3">
                      
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">
                          {language === 'cn' ? '目标对接核心区域' : 'Target Region'}
                        </label>
                        <select
                          id="match-region-select"
                          value={customReqRegion}
                          onChange={(e: any) => setCustomReqRegion(e.target.value)}
                          className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
                        >
                          <option value="sea">东南亚 (Southeast Asia)</option>
                          <option value="africa">非洲地区 (Africa Markets)</option>
                          <option value="india">印度制造 (India Region)</option>
                          <option value="iran">伊朗安全专区 (Iran Channel)</option>
                          <option value="eu">欧盟区 (EU Admissions)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">
                          {language === 'cn' ? '资质探访/供需诉求' : 'Detailed Trust Requirements'}
                        </label>
                        <textarea
                          id="match-req-textarea"
                          rows={3}
                          placeholder={language === 'cn' ? '例如：核实印尼雅加达某机械厂的营业执照与近三年海关报关记录...' : 'e.g., verifying the export license of a Jakarta mechanical firm.'}
                          value={customReqText}
                          onChange={(e) => setCustomReqText(e.target.value)}
                          className="w-full p-2.5 text-xs rounded bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                          required
                        ></textarea>
                      </div>

                      <button
                        id="match-submit-btn"
                        type="submit"
                        className="w-full py-2 bg-slate-950 hover:bg-slate-850 text-cyan-400 hover:text-cyan-300 border border-slate-800 rounded text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        {t.matchSubmitBtn}
                      </button>

                    </form>

                    {customReqSubmitted && (
                      <div className="mt-3 p-3 rounded bg-emerald-950/40 border border-emerald-900 text-[11px] text-slate-300">
                        {language === 'cn'
                          ? '✓ 对接申请已封装，已通过 Cloudflare Worker 加密通道传输至衡信审核团队。'
                          : '✓ Request dispatched via Workers API. Our regional audit specialist will get in touch.'}
                      </div>
                    )}

                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between text-[10px] font-mono text-slate-500">
                    <span>API PROTOCOL: https</span>
                    <span>CIPHER: TLS_AES_256_GCM</span>
                  </div>
                </div>

              </div>

            </div>
          </section>
        </>
      )}

      {/* 6. SYSTEM STABILITY & EDGE INFRASTRUCTURE (CF Theme description) */}
      <section className="py-12 bg-slate-950/80 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-lg font-bold text-slate-100 flex items-center justify-center gap-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              <span>{t.techTitle}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-2 max-w-2xl mx-auto">
              {t.techDesc}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-mono text-slate-400">
                Cloudflare Pages (Front-End Edge Host)
              </span>
              <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-mono text-slate-400">
                Cloudflare D1 (Structured Relational Supplier DB)
              </span>
              <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-mono text-slate-400">
                Cloudflare R2 (Uncompressed Photo/Video Buckets)
              </span>
              <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-mono text-slate-400">
                Cloudflare Workers (Secure API & Dispatching Router)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER & DISCLAIMER (Prompt 2 Requirement 5) */}
      <footer className="pt-16 bg-slate-950 text-slate-400 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-12">
            
            {/* Disclaimer & Iran Warning Panel */}
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>{language === 'cn' ? '衡信平台免责声明与风控提示' : 'VeriCred Disclaimer & Trade Risk Protocol'}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'cn'
                  ? '【免责声明】：本平台仅做企业实力信息、工商登记核验、海关申报记录等客观公开实力展示与供需对接洽谈，本平台不参与后续交易链条、不经手资金、不收取任何佣金抽成、亦不提供货款担保和质量担保。境外贸易受汇率波动、政策法务、国际物流等不可抗力因素影响，一切商贸合作风险均需供需双方自行甄别、自担风险。'
                  : 'Disclaimer: VeriCred only serves as an objective enterprise capability display & matching platform. We do not participate in payments, hold funds, or charge transactional commissions. Any subsequent business operations and international cargo movements are conducted at your own commercial and regulatory risk.'}
              </p>

              {/* Dedicated Iran international trade warning */}
              <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-slate-300">
                <p className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  {language === 'cn' ? '【重要：伊朗区域国际贸易专项风控提示】' : '【CRITICAL: Iran Regional Trade Special Risk Alert】'}
                </p>
                <p className="leading-relaxed text-slate-400 text-[11px]">
                  {language === 'cn'
                    ? '针对伊朗区域的所有商贸对接，因该地区受到联合国及相关单边制裁影响，涉及大额资金跨境结算、信用证(L/C)、特定涉外法律法规均存在极高合规变动风控。我们仅核备对方企业在当地的存续状态和实地物理厂房（通过安全机制），平台强烈建议供需双方在洽谈时，选用符合中伊多边安全法规的合规金融结算服务机构，切勿私下开展不合规金融结转。'
                    : 'Iran is subject to international financial sanctions. Cross-border settlements, Letters of Credit (L/C), and international logistics face high regulatory and operational compliance shifts. VeriCred strongly advises using authorized bi-lateral trade payment mechanisms. Private unregulated transactions are highly discouraged.'}
                </p>
              </div>
            </div>

            {/* Quick stats / credentials info */}
            <div className="md:col-span-4 space-y-3 font-mono text-xs">
              <span className="block text-slate-500 uppercase tracking-widest">{language === 'cn' ? '全站技术指引' : 'Technical Credentials'}</span>
              <div className="space-y-1 text-slate-400">
                <p>STATUS: <span className="text-emerald-400 font-bold">{t.statusActive}</span></p>
                <p>SQL SERVER: CLOUDFLARE_D1_EDGE</p>
                <p>CDN REGION: SEA_AF_IND_IR_EU</p>
                <p>COMPLIANCE: VERIFIED_MERCHANT_LOGS</p>
              </div>
            </div>

          </div>

          {/* Core Footer Trademark Info */}
          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-600">
            <div>
              <span>{t.footerRights}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-right">
              <span>GDPR COGNITIVE // CLOUDFLARE Pages</span>
              <span className="text-cyan-400 font-bold">VerCred v1.0</span>
              <span className="text-slate-500">({language === 'cn' ? '静态预置版本，方便迭代区分' : 'Static Preset Version'})</span>
            </div>
          </div>

        </div>
      </footer>

      {/* ========================================================== */}
      {/* MODAL 3: Merchant Audit Dossier Modal (多Agent核验档案) */}
      {/* ========================================================== */}
      {selectedMerchantForDossier && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl shadow-cyan-950/20">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 uppercase tracking-wider">
                  D1 SECURE LEDGER // MULTI-AGENT VERIFICATION REPORT
                </span>
                <h3 className="text-lg font-black text-slate-100 mt-1">
                  {language === 'cn' ? selectedMerchantForDossier.nameCn : selectedMerchantForDossier.nameEn}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMerchantForDossier(null)}
                className="text-slate-400 hover:text-slate-100 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                CLOSE [X]
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 font-sans">
              
              {/* Core metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">{language === 'cn' ? '信誉得分' : 'Trust Score'}</span>
                  <span className="text-emerald-400 font-bold text-base">{selectedMerchantForDossier.trustScore}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">{language === 'cn' ? '已审核厂区' : 'Audited Plant Area'}</span>
                  <span className="text-slate-200 font-bold text-base">{selectedMerchantForDossier.plantAreaSqM} ㎡</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">{language === 'cn' ? '真实员工数' : 'Active Headcount'}</span>
                  <span className="text-slate-200 font-bold text-base">{selectedMerchantForDossier.verifiedWorkers}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">{language === 'cn' ? '创办年份' : 'Est. Year'}</span>
                  <span className="text-slate-300 font-bold">{selectedMerchantForDossier.establishedYear}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">{language === 'cn' ? '年度核产值' : 'Certified Output'}</span>
                  <span className="text-cyan-400 font-bold">{selectedMerchantForDossier.certifiedOutput}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">{language === 'cn' ? '数据底座同步' : 'D1 Ledger Sync'}</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>ACTIVE</span>
                  </span>
                </div>
              </div>

              {/* Physical Location Address */}
              <div>
                <h4 className="text-xs font-mono font-bold text-cyan-400 mb-2 uppercase tracking-wide">
                  {language === 'cn' ? '■ 实地物理探访审计地址' : '■ Physical Audited Address'}
                </h4>
                <div className="text-xs text-slate-300 bg-slate-950/30 border border-slate-800/80 p-3 rounded-lg leading-relaxed font-mono">
                  {language === 'cn' ? selectedMerchantForDossier.addressCn : selectedMerchantForDossier.addressEn}
                </div>
              </div>

              {/* Multi-agent step-by-step verification ledger logs */}
              <div>
                <h4 className="text-xs font-mono font-bold text-cyan-400 mb-2 uppercase tracking-wide">
                  {language === 'cn' ? '■ 智能化多 Agent 联合探访链审计日志' : '■ Multi-Agent Active Verification Log'}
                </h4>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-mono text-[11px] text-slate-400">
                  <div className="flex items-start gap-2 border-b border-slate-900 pb-2.5">
                    <span className="text-cyan-400 font-bold">[AGENT-1]</span>
                    <div>
                      <span className="text-slate-200 block font-bold">{language === 'cn' ? '物理GPS与现场图像核验' : 'Physical Location & Video Stream Verification'}</span>
                      <span className="block mt-0.5 text-slate-400 leading-relaxed">
                        {language === 'cn' 
                          ? `已建立加密视频中继。现场拍摄的物理厂区图像及无人机三维外廊扫描成果已成功存入 R2 缓存：r2-cdn://verify-assets/${selectedMerchantForDossier.id}/onsite_3d.mp4` 
                          : `Physical visual stream synced. Ground-truth images of the production lines and manufacturing floors successfully archived to R2 storage bucket: r2-cdn://verify-assets/${selectedMerchantForDossier.id}/onsite_3d.mp4`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 border-b border-slate-900 pb-2.5">
                    <span className="text-blue-400 font-bold">[AGENT-2]</span>
                    <div>
                      <span className="text-slate-200 block font-bold">{language === 'cn' ? '商事与工商档案库直连对账' : 'Corporate Registry ledger Crosscheck'}</span>
                      <span className="block mt-0.5 text-slate-400 leading-relaxed">
                        {language === 'cn'
                          ? `直连东盟/多国工商公示数据库，获取并校对法人、实缴资本、股权架构等底层信息。状态：对账成功，工商码已在 D1 锁定。`
                          : `Querying primary international enterprise registry databases... Business license status, legal representatives, and active registers confirmed. State: LOCKED & SYNCHRONIZED.`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 border-b border-slate-900 pb-2.5">
                    <span className="text-indigo-400 font-bold">[AGENT-3]</span>
                    <div>
                      <span className="text-slate-200 block font-bold">{language === 'cn' ? '海关进出口凭单 & 贸易链路穿透' : 'Customs & Cargo Receipt Ledger Scan'}</span>
                      <span className="block mt-0.5 text-slate-400 leading-relaxed">
                        {language === 'cn'
                          ? `已提取最近24个月报关大单、离岸税单等高密贸易流。穿透核对结果：出货规模、纳税等级与企业申报实物产量在数学模型上高度自洽。`
                          : `Successfully audited customs clearance ledgers, ocean bills of lading, and global cargo manifests. Trade volume matches direct on-site physical capacity projections.`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">[CONSENSUS]</span>
                    <div>
                      <span className="text-emerald-400 block font-bold">{language === 'cn' ? '多 Agent 联合核验完成' : 'Consensus Formed & Secured'}</span>
                      <span className="block mt-0.5 text-slate-400 leading-relaxed">
                        {language === 'cn'
                          ? `所有审计流与账目流水已在 Cloudflare D1 存储，并分配 SHA-256 核验指纹，保障全生命周期防伪。`
                          : `Audit block successfully signed. Checksum committed to secure Cloudflare D1 nodes. Audit file is active and fully secure.`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom message */}
              <div className="p-3.5 rounded-xl border border-emerald-950 bg-emerald-950/10 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0 animate-pulse" />
                <span>
                  {language === 'cn' 
                    ? '本报告由自研多 Agent 核验框架动态出具，数据不可篡改。如需获取原始高密单据，请联系大客户经理。' 
                    : 'This report is dynamically queried and cross-matched in real-time. Original paperwork can be requested under high-trust authorizations.'}
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedMerchantForDossier(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-300 border border-slate-800 rounded-lg cursor-pointer"
              >
                {language === 'cn' ? '关闭' : 'Close'}
              </button>
              <button
                onClick={() => {
                  setSelectedSupplierForContact({
                    id: selectedMerchantForDossier.id,
                    nameCn: selectedMerchantForDossier.nameCn,
                    nameEn: selectedMerchantForDossier.nameEn,
                    region: selectedMerchantForDossier.market,
                    industry: selectedMerchantForDossier.industry,
                    descCn: selectedMerchantForDossier.addressCn,
                    descEn: selectedMerchantForDossier.addressEn,
                    trustScore: selectedMerchantForDossier.trustScore,
                    verifiedCount: selectedMerchantForDossier.verifiedWorkers,
                    rating: 'AAA',
                    workers: selectedMerchantForDossier.verifiedWorkers,
                    area: selectedMerchantForDossier.plantAreaSqM,
                    dossierLogs: [],
                    certificates: [],
                    representativeName: 'Manager'
                  } as any);
                  setSelectedMerchantForDossier(null);
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono rounded-lg cursor-pointer"
              >
                {language === 'cn' ? '一键对接洽谈' : 'Initiate Matchmaking'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 4: Factory Raw Credentials Detail Modal (原始高密单据详情弹窗) */}
      {/* ========================================================== */}
      {selectedMerchantForDetail && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl shadow-cyan-950/20">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 uppercase tracking-wider">
                  SECURE STORAGE // API ENDPOINT: /api/factory/detail?id={selectedMerchantForDetail.id}
                </span>
                <h3 className="text-lg font-black text-slate-100 mt-1 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cyan-400" />
                  <span>
                    {language === 'cn' ? `${selectedMerchantForDetail.nameCn} - 原始单据档案` : `${selectedMerchantForDetail.nameEn} - Certified Credentials`}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedMerchantForDetail(null)}
                className="text-slate-400 hover:text-slate-100 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                CLOSE [X]
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 font-sans">
              {isDetailLoading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
                  <span className="text-xs font-mono text-cyan-400 animate-pulse">
                    {language === 'cn' 
                      ? `正在连接 /api/factory/detail?id=${selectedMerchantForDetail.id} 调取高密单据，请稍候...` 
                      : `Querying raw dossier from secure endpoint, please wait...`}
                  </span>
                </div>
              ) : factoryDetail ? (
                <div className="space-y-6">
                  
                  {/* 1. Business License Section (营业执照) */}
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full"></span>
                      <span>{language === 'cn' ? '■ 营业执照资质核备案' : '■ Business License Record'}</span>
                    </h4>
                    <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50 p-4 flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center relative group">
                        <img 
                          src={factoryDetail.businessLicenseUrl} 
                          alt="Business License Preview"
                          referrerPolicy="no-referrer"
                          className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
                          <Eye className="h-5 w-5 text-cyan-400" />
                        </div>
                      </div>
                      <div className="flex-1 text-xs space-y-1.5 text-slate-300 font-mono">
                        <p className="font-bold text-slate-100">{language === 'cn' ? '三证合一登记证码 / Unified Social Credit Code:' : 'Unified Social Credit Code:'}</p>
                        <p className="text-cyan-400 font-bold bg-slate-950/80 px-2 py-1 rounded inline-block">91340100MA2P{selectedMerchantForDetail.id.toUpperCase()}</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {language === 'cn' 
                            ? '已通过国家商事系统以及当地工商管理局直连交叉比对，确属有效在营企业。' 
                            : 'Direct cross-match query through the Ministry of Commerce & Industry confirmed active.'}
                        </p>
                      </div>
                      <a 
                        href={factoryDetail.businessLicenseUrl} 
                        target="_blank" 
                        rel="noopener"
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 text-[11px] rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>{language === 'cn' ? '调阅原件' : 'View Original'}</span>
                      </a>
                    </div>
                  </div>

                  {/* 2. Video Verification Playback Section (视频核验回放地址) */}
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full"></span>
                      <span>{language === 'cn' ? '■ 视频探访核验回放存证' : '■ Video Verification Playback Archive'}</span>
                    </h4>
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80">
                      <video 
                        src={factoryDetail.videoPlaybackUrl} 
                        controls
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="w-full aspect-video object-cover opacity-80 hover:opacity-100 transition-opacity"
                      />
                      <div className="p-3 bg-slate-950 border-t border-slate-900 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                        <span>RELAY STREAM ID: r2-cdn://stream-logs/{selectedMerchantForDetail.id}.mp4</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                          SECURE REPLAY
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Customs Historical Shipping Records Section (海关历史出货单据) */}
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full"></span>
                      <span>{language === 'cn' ? '■ 海关出口通关提货凭单链' : '■ Customs & Cargo Ledger Audit'}</span>
                    </h4>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 font-mono text-[11px] text-slate-400">
                      {factoryDetail.customsDocuments.map((doc, idx) => (
                        <div key={idx} className="flex items-start gap-2 border-b border-slate-900/50 pb-2 last:border-0 last:pb-0">
                          <span className="text-cyan-400 font-bold">[{idx + 1}]</span>
                          <span className="text-slate-300 leading-relaxed">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Complete Certifications Section (全部资质档案) */}
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full"></span>
                      <span>{language === 'cn' ? '■ 平台审计备案准入资质档案' : '■ Registered Environmental & Quality Standards'}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {factoryDetail.certifications.map((cert, idx) => (
                        <div 
                          key={idx} 
                          className="bg-slate-950/40 border border-slate-850 p-3 rounded-lg flex items-start gap-2.5 hover:border-slate-800 transition-colors"
                        >
                          <Award className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 font-medium leading-relaxed">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom safety verification watermark */}
                  <div className="p-3 rounded-xl border border-emerald-950 bg-emerald-950/10 text-xs text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span>
                      {language === 'cn' 
                        ? '本报告单据全部提取自真实海关与商事底层D1节点，数据真实有效，已加盖VerCred验证指纹。' 
                        : 'All documents dynamically extracted from genuine customs & commercial registry databases. Signed with VerCred fingerprint.'}
                    </span>
                  </div>

                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  {language === 'cn' ? '无法获取该工厂资质，请稍后再试。' : 'Unable to retrieve factory credentials, please try again.'}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedMerchantForDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-300 border border-slate-800 rounded-lg cursor-pointer"
              >
                {language === 'cn' ? '关闭' : 'Close'}
              </button>
              <button
                onClick={() => {
                  setSelectedSupplierForContact({
                    id: selectedMerchantForDetail.id,
                    nameCn: selectedMerchantForDetail.nameCn,
                    nameEn: selectedMerchantForDetail.nameEn,
                    region: selectedMerchantForDetail.market,
                    industry: selectedMerchantForDetail.industry,
                    descCn: selectedMerchantForDetail.addressCn,
                    descEn: selectedMerchantForDetail.addressEn,
                    trustScore: selectedMerchantForDetail.trustScore,
                    verifiedCount: selectedMerchantForDetail.verifiedWorkers || 120,
                    rating: 'AAA',
                    workers: selectedMerchantForDetail.verifiedWorkers || 120,
                    area: selectedMerchantForDetail.plantAreaSqM || 5000,
                    dossierLogs: [],
                    certificates: [],
                    representativeName: 'Manager'
                  } as any);
                  setSelectedMerchantForDetail(null);
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono rounded-lg cursor-pointer"
              >
                {language === 'cn' ? '一键对接洽谈' : 'Initiate Matchmaking'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 1: Real-Media Portfolio Modal (实拍素材入口) */}
      {/* ========================================================== */}
      {/* ========================================================== */}
      {selectedSupplierForMedia && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  Verified Real-Evidence Media Logs // D1 & R2 Cache
                </span>
                <h3 className="text-base font-extrabold text-slate-100">
                  {language === 'cn' ? selectedSupplierForMedia.nameCn : selectedSupplierForMedia.nameEn}
                </h3>
              </div>
              <button
                id="close-media-modal"
                onClick={() => setSelectedSupplierForMedia(null)}
                className="text-slate-500 hover:text-slate-100 text-xs font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
              >
                [ESC / CLOSE]
              </button>
            </div>

            {/* Tabs Selector for multimedia content */}
            <div className="flex bg-slate-950 border-b border-slate-800 p-1 text-xs font-mono">
              <button
                id="tab-media-video"
                onClick={() => setActiveMediaTab('video')}
                className={`flex-1 py-2 rounded text-center transition-colors ${
                  activeMediaTab === 'video' 
                    ? 'bg-cyan-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎥 {language === 'cn' ? '厂区生产实拍视频' : 'Factory Video Tour'}
              </button>
              <button
                id="tab-media-certs"
                onClick={() => setActiveMediaTab('certs')}
                className={`flex-1 py-2 rounded text-center transition-colors ${
                  activeMediaTab === 'certs' 
                    ? 'bg-cyan-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📜 {language === 'cn' ? '已核准准入资质证书' : 'Verified Certificates'}
              </button>
              <button
                id="tab-media-registry"
                onClick={() => setActiveMediaTab('registry')}
                className={`flex-1 py-2 rounded text-center transition-colors ${
                  activeMediaTab === 'registry' 
                    ? 'bg-cyan-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🏛️ {language === 'cn' ? '工商及出口交收记录' : 'Customs & Tax Audit'}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 min-h-[220px] text-slate-300 text-xs space-y-4">
              
              {activeMediaTab === 'video' && (
                <div className="space-y-4">
                  {/* Mock factory video wrapper */}
                  <div className="relative aspect-video rounded-lg bg-slate-950 border border-slate-850 flex flex-col items-center justify-center text-center p-6 overflow-hidden">
                    {/* Visual glowing play button */}
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/20 to-transparent"></div>
                    <div className="h-14 w-14 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center text-cyan-400 mb-3 animate-pulse">
                      <Play className="h-6 w-6" />
                    </div>
                    <p className="font-bold text-slate-200">{language === 'cn' ? '【衡信核验】实地生产品质探探访视频.mp4' : 'Verified Factory Floor Footage Log'}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      SOURCE: R2_BUCKET_ACCELERATED_MP4 // RESOLUTION: 1080P // DURATION: 01:45
                    </p>
                    <span className="absolute bottom-2 right-3 text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded">
                      🛡️ CLOUDFLARE CDN PASS
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {language === 'cn'
                      ? '注：上述实拍素材由衡信平台海外分站审计专员手持设备实地拍摄录制，已通过工商实物主体一致性校验，确认在东南亚/非洲本地园区自置物理生产线无误。'
                      : 'Note: Video captured on-site by VeriCred field auditors, verifying operational high-speed machinery and assembly systems.'}
                  </p>
                </div>
              )}

              {activeMediaTab === 'certs' && (
                <div className="space-y-3">
                  <span className="block text-[10px] font-mono text-slate-500 uppercase">
                    ACCREDITED REGULATORY CERTIFICATES (SECURED IN CLOUDFLARE R2)
                  </span>
                  
                  <div className="space-y-2">
                    {selectedSupplierForMedia.certificates.map((cert, index) => (
                      <div key={index} className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-cyan-400" />
                          <span className="text-slate-200">{cert}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                          ACTIVE VERIFIED
                        </span>
                      </div>
                    ))}
                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-cyan-400" />
                        <span className="text-slate-200">{language === 'cn' ? '企业统一社会信用代码/海外注册编号' : 'Global Corporate Registry Code'}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                        MATCHED (100%)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeMediaTab === 'registry' && (
                <div className="space-y-3">
                  <span className="block text-[10px] font-mono text-slate-500 uppercase">
                    D1 RELATIONAL DATABASE TRUTH METRICS
                  </span>
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-2 font-mono text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>{language === 'cn' ? '工商实缴资本 / Paid-in Capital' : 'Paid-in Capital'}:</span>
                      <strong className="text-slate-200">20,000,000 RMB / EQUIVALENT</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'cn' ? '已验证物理雇员数 / Verified Employee Headcount' : 'Verified Staff Headcount'}:</span>
                      <strong className="text-slate-200">{selectedSupplierForMedia.verifiedWorkers} Workers (Real Headcount)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'cn' ? '厂区总占地面积 / Industrial Floor Space' : 'Industrial Area Space'}:</span>
                      <strong className="text-slate-200">{selectedSupplierForMedia.plantAreaSqM} ㎡</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'cn' ? '财务往来安全记录 / Verified Credit Score' : 'Corporate Credit Score'}:</span>
                      <strong className="text-emerald-400">CLASS-A (EXCELLENT)</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-900 text-[10px] text-slate-500">
                      <span>LAST_D1_SYNC_TIME</span>
                      <span>2026-07-01 UTC</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Close footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-850 flex justify-end">
              <button
                id="close-media-footer"
                onClick={() => setSelectedSupplierForMedia(null)}
                className="px-4 py-2 bg-slate-900 text-slate-400 hover:text-slate-200 text-xs rounded border border-slate-800 font-mono cursor-pointer"
              >
                {language === 'cn' ? '完成查验' : 'Close Verification Logs'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 2: Contact/Matchmaking Form Modal (对接洽谈) */}
      {/* ========================================================== */}
      {selectedSupplierForContact && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  Edge Secured Handshake Protocol
                </span>
                <h3 className="text-base font-extrabold text-slate-100">
                  {language === 'cn' ? '建立实力供需对接' : 'Request Official Secure Match'}
                </h3>
              </div>
              <button
                id="close-contact-modal"
                onClick={() => setSelectedSupplierForContact(null)}
                className="text-slate-500 hover:text-slate-200 text-xs font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
              >
                [CLOSE]
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              
              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-400">
                <span className="block text-[10px] font-mono text-cyan-500 uppercase mb-1">Target Merchant:</span>
                <strong className="text-slate-200">
                  {language === 'cn' ? selectedSupplierForContact.nameCn : selectedSupplierForContact.nameEn}
                </strong>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  {t.contactSubtitle}
                </p>
              </div>

              {!contactSubmitted ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSubmitted(true);
                  }}
                  className="space-y-3"
                >
                  
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">{t.formName}</label>
                    <input
                      id="contact-name-input"
                      type="text"
                      required
                      placeholder={language === 'cn' ? '例：李经理' : 'e.g. Michael Lee'}
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">{t.formCompany}</label>
                    <input
                      id="contact-company-input"
                      type="text"
                      required
                      placeholder={language === 'cn' ? '您的企业/组织名称' : 'Your enterprise name'}
                      value={contactCompany}
                      onChange={(e) => setContactCompany(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">{t.formContact}</label>
                    <input
                      id="contact-info-input"
                      type="text"
                      required
                      placeholder={language === 'cn' ? '微信号、Email、或 WhatsApp 账号' : 'WhatsApp / Email / WeChat'}
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">{t.formMessage}</label>
                    <textarea
                      id="contact-message-input"
                      rows={3}
                      required
                      placeholder={language === 'cn' ? '如：需要调阅该厂的最新海关报关电子底单、安排实地视频对线，意向采购高档面料...' : 'Describe your specific credential or trade matchmaking requirements...'}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full p-2.5 text-xs rounded bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    ></textarea>
                  </div>

                  <button
                    id="contact-submit-btn"
                    type="submit"
                    className="w-full py-2.5 rounded bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all cursor-pointer"
                  >
                    {t.formSubmit}
                  </button>

                </form>
              ) : (
                <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-900 space-y-3 text-xs">
                  <p className="text-emerald-400 font-bold">✓ {language === 'cn' ? '安全传输成功！' : 'Secure Dispatch Complete!'}</p>
                  <p className="text-slate-300 leading-relaxed">
                    {t.formSuccess}
                  </p>
                  <div className="pt-3 border-t border-emerald-900/40 font-mono text-[10px] text-slate-500">
                    SENDER: {contactName} ({contactCompany}) <br />
                    ROUTING_NODE: workers_matchmaking_api_v1
                  </div>
                </div>
              )}

            </div>

            {/* Footer Close */}
            <div className="p-4 bg-slate-950 border-t border-slate-850 flex justify-end">
              <button
                id="close-contact-footer"
                onClick={() => {
                  setSelectedSupplierForContact(null);
                  setContactSubmitted(false);
                }}
                className="px-4 py-2 bg-slate-900 text-slate-400 hover:text-slate-200 text-xs rounded border border-slate-800 font-mono cursor-pointer"
              >
                {language === 'cn' ? '返回名录' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
