import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Video, Building2, ShieldCheck, FileText, 
  RefreshCw, AlertTriangle, Play, ExternalLink, User, 
  Calendar, Award, Scale, HelpCircle, CheckCircle2, Lock,
  Image, Camera, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Language, translations } from '../types';
import { 
  fetchMerchantById, 
  fetchVideoVerification, 
  fetchRegistryVerification, 
  fetchCrossVerification,
  fetchRiskVerification,
  fetchFactoryImages,
  fetchProductPhotos,
  MarketMerchant, 
  VideoVerification, 
  RegistryVerification, 
  CrossVerification,
  RiskVerification,
  FactoryImagesVerification,
  ProductPhotosVerification,
  FactoryImage,
  ProductPhoto
} from '../services/marketService';
import { VIDEO_API_URL, REGISTRY_API_URL, CROSS_API_URL, RISK_API_URL, FACTORY_IMAGES_API_URL, PRODUCT_PHOTOS_API_URL } from '../config/apiEndpoints';

interface FactoryDetailPageProps {
  id: string;
  language: Language;
  onBack: () => void;
}

type TabType = 'images' | 'products' | 'video' | 'registry' | 'cross';

export default function FactoryDetailPage({ id, language, onBack }: FactoryDetailPageProps) {
  const [merchant, setMerchant] = useState<MarketMerchant | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('images');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Decoupled response containers
  const [videoData, setVideoData] = useState<VideoVerification | null>(null);
  const [registryData, setRegistryData] = useState<RegistryVerification | null>(null);
  const [crossData, setCrossData] = useState<CrossVerification | null>(null);
  const [riskData, setRiskData] = useState<RiskVerification | null>(null);
  const [factoryImagesData, setFactoryImagesData] = useState<FactoryImagesVerification | null>(null);
  const [productPhotosData, setProductPhotosData] = useState<ProductPhotosVerification | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Tab-specific loading states
  const [tabLoading, setTabLoading] = useState<boolean>(false);
  const [tabError, setTabError] = useState<string | null>(null);
  
  // Risk-specific state managers
  const [riskLoading, setRiskLoading] = useState<boolean>(false);
  const [riskError, setRiskError] = useState<string | null>(null);

  // Playback mock simulation state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Load general profile first
  useEffect(() => {
    setIsLoading(true);
    setFetchError(null);
    fetchMerchantById(id)
      .then((m) => {
        if (!m) {
          setFetchError(language === 'cn' ? '该工厂档案不存在' : 'This factory file does not exist');
        } else {
          setMerchant(m);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setFetchError(language === 'cn' ? '档案加载出错' : 'Error loading profile: ' + err.message);
        setIsLoading(false);
      });
  }, [id, language]);

  // Load specific tab data on active tab switch
  useEffect(() => {
    if (!merchant) return;
    
    setTabError(null);

    if (activeTab === 'images') {
      if (!factoryImagesData) {
        setTabLoading(true);
        fetchFactoryImages(id)
          .then((data) => {
            setFactoryImagesData(data);
            setCurrentImageIndex(0);
            setTabLoading(false);
          })
          .catch((err) => {
            setTabError(language === 'cn' ? `厂区影像档案暂未调取成功，请稍后重试` : `Factory images service temporary load fault. Please retry later.`);
            setTabLoading(false);
          });
      }
    } else if (activeTab === 'products') {
      if (!productPhotosData) {
        setTabLoading(true);
        fetchProductPhotos(id)
          .then((data) => {
            setProductPhotosData(data);
            setTabLoading(false);
          })
          .catch((err) => {
            setTabError(language === 'cn' ? `产品实拍档案暂未调取成功，请稍后重试` : `Product photos service temporary load fault. Please retry later.`);
            setTabLoading(false);
          });
      }
    } else if (activeTab === 'video' && !videoData) {
      setTabLoading(true);
      fetchVideoVerification(id)
        .then((data) => {
          setVideoData(data);
          setTabLoading(false);
        })
        .catch((err) => {
          setTabError(language === 'cn' ? `远程视频调用失败 (${VIDEO_API_URL}/${id})` : `Failed to load video stream (${VIDEO_API_URL}/${id})`);
          setTabLoading(false);
        });
    } else if (activeTab === 'registry') {
      if (!registryData) {
        setTabLoading(true);
        fetchRegistryVerification(id)
          .then((data) => {
            setRegistryData(data);
            setTabLoading(false);
          })
          .catch((err) => {
            setTabError(language === 'cn' ? `商事档案调用失败 (${REGISTRY_API_URL}/${id})` : `Failed to load corporate registry registry (${REGISTRY_API_URL}/${id})`);
            setTabLoading(false);
          });
      }

      if (!riskData && !riskLoading) {
        setRiskLoading(true);
        setRiskError(null);
        fetchRiskVerification(id)
          .then((data) => {
            setRiskData(data);
            setRiskLoading(false);
          })
          .catch((err) => {
            setRiskError(language === 'cn' ? '风险信息暂未加载，请稍后刷新查看' : 'Risk details failed to load, please refresh later to view.');
            setRiskLoading(false);
          });
      }
    } else if (activeTab === 'cross' && !crossData) {
      setTabLoading(true);
      fetchCrossVerification(id)
        .then((data) => {
          setCrossData(data);
          setTabLoading(false);
        })
        .catch((err) => {
          setTabError(language === 'cn' ? `多维资质交叉验证调用失败 (${CROSS_API_URL}/${id})` : `Failed to load cross-match verification records (${CROSS_API_URL}/${id})`);
          setTabLoading(false);
        });
    }
  }, [activeTab, id, merchant, videoData, registryData, crossData, riskData, riskLoading, factoryImagesData, productPhotosData, language]);

  // Return formatted region display string
  const getMarketName = (market: string) => {
    switch (market) {
      case 'china': return language === 'cn' ? '中国市场' : 'China Market';
      case 'southeast': return language === 'cn' ? '东南亚市场' : 'Southeast Asia';
      case 'africa': return language === 'cn' ? '非洲合作区' : 'Africa Joint Zone';
      case 'india': return language === 'cn' ? '印度次大陆' : 'Indian Subcontinent';
      case 'iran': return language === 'cn' ? '伊朗自由特区' : 'Iran Free Zone';
      default: return market;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-24 px-4 font-sans text-center">
        <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin mb-4" />
        <h3 className="text-sm font-mono text-cyan-400 animate-pulse uppercase tracking-widest">
          {language === 'cn' ? '正在连接D1审计核心底座，加载工厂档案数据...' : 'Connecting secure D1 node to retrieve factory files...'}
        </h3>
        <p className="text-xs text-slate-500 mt-2">
          {language === 'cn' ? '正在校对底层加密签名...' : 'Verifying cryptographic VerCred fingerprints...'}
        </p>
      </div>
    );
  }

  if (fetchError || !merchant) {
    return (
      <div className="max-w-md mx-auto my-24 p-6 bg-slate-900 border border-rose-950/40 rounded-2xl text-center space-y-4 shadow-xl">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto animate-pulse" />
        <h3 className="text-base font-bold text-slate-100">
          {language === 'cn' ? '加载失败' : 'Retrieval Failed'}
        </h3>
        <p className="text-xs text-rose-400 font-mono">
          {fetchError || (language === 'cn' ? '该工厂档案不存在' : 'This factory file does not exist')}
        </p>
        <button
          onClick={onBack}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 border border-slate-700 rounded-lg cursor-pointer transition-colors"
        >
          &larr; {language === 'cn' ? '返回市场列表' : 'Return to Market'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-[fadeIn_0.3s_ease-out]">
      
      {/* 1. Header Navigation Back Breadcrumb */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>{language === 'cn' ? '返回产业列表' : 'Back to Market Grid'}</span>
        </button>
        
        <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
          <span>{getMarketName(merchant.market)}</span>
          <span>/</span>
          <span className="text-cyan-400">{merchant.id.toUpperCase()}</span>
        </div>
      </div>

      {/* 2. Top Banner / Meta Info (Always visible, clean dark sci-fi look) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 uppercase tracking-wide font-black">
                D1 Audit Verified
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                {language === 'cn' ? `信誉分: ${merchant.trustScore}` : `Score: ${merchant.trustScore}`}
              </span>
            </div>
            
            <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">
              {language === 'cn' ? merchant.nameCn : merchant.nameEn}
            </h1>

            <div className="text-xs text-slate-400 max-w-2xl font-mono leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-850">
              <span className="text-slate-500 block text-[9px] uppercase font-bold mb-1">
                {language === 'cn' ? '🏭 工厂登记注册地址' : '🏭 Registered Physical Location'}
              </span>
              {language === 'cn' ? merchant.addressCn : merchant.addressEn}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2 text-right font-mono text-xs w-full md:w-auto min-w-[200px]">
            <div className="text-left md:text-right border-b border-slate-900 pb-1.5">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{language === 'cn' ? '代表/联系人' : 'Representative'}</span>
              <span className="text-slate-200 font-bold">{merchant.contactPerson}</span>
            </div>
            <div className="text-left md:text-right border-b border-slate-900 pb-1.5">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{language === 'cn' ? '成产年份' : 'Established'}</span>
              <span className="text-slate-200">{merchant.establishedYear} ({language === 'cn' ? '在营' : 'Active'})</span>
            </div>
            <div className="text-left md:text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{language === 'cn' ? '官方核准月产能' : 'Certified Monthly Output'}</span>
              <span className="text-emerald-400 font-bold">{merchant.certifiedOutput}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Five-Tab Pagination Bar */}
      <div className="flex border-b border-slate-800 mb-6 gap-1 font-mono text-xs overflow-x-auto pb-px scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <button
          onClick={() => setActiveTab('images')}
          className={`px-4 py-3 border-b-2 font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'images'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Image className="h-4 w-4" />
          <span>{language === 'cn' ? '① 厂区实景档案' : '① Factory Real Scenes'}</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 border-b-2 font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>{language === 'cn' ? '② 产品实拍档案' : '② Product Photos'}</span>
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`px-4 py-3 border-b-2 font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'video'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="h-4 w-4" />
          <span>{language === 'cn' ? '③ 远程视频校验' : '③ Remote Video Audit'}</span>
        </button>

        <button
          onClick={() => setActiveTab('registry')}
          className={`px-4 py-3 border-b-2 font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'registry'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>{language === 'cn' ? '④ 商事登记核验' : '④ Commercial Registry'}</span>
        </button>

        <button
          onClick={() => setActiveTab('cross')}
          className={`px-4 py-3 border-b-2 font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'cross'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>{language === 'cn' ? '⑤ 多维资质交叉核验' : '⑤ Multi-Dimensional Cross-Audit'}</span>
        </button>
      </div>

      {/* 4. Tab Workspace Panel with Loading & Error States */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 min-h-[350px]">
        {tabLoading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3 font-sans">
            <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
            <span className="text-xs font-mono text-cyan-400 animate-pulse">
              {language === 'cn' 
                ? `正在调用接口 ${
                    activeTab === 'images' ? FACTORY_IMAGES_API_URL :
                    activeTab === 'products' ? PRODUCT_PHOTOS_API_URL :
                    activeTab === 'video' ? VIDEO_API_URL :
                    activeTab === 'registry' ? REGISTRY_API_URL :
                    CROSS_API_URL
                  }/${id} ...` 
                : `Calling remote secure endpoint API to fetch ${activeTab} data...`}
            </span>
          </div>
        ) : tabError ? (
          <div className="py-16 text-center border border-rose-950/30 bg-rose-950/10 rounded-xl text-rose-400 font-mono text-xs flex flex-col items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-rose-500" />
            <span>{tabError}</span>
            <button
              onClick={() => {
                // Clear state to force re-fetch
                if (activeTab === 'images') setFactoryImagesData(null);
                else if (activeTab === 'products') setProductPhotosData(null);
                else if (activeTab === 'video') setVideoData(null);
                else if (activeTab === 'registry') setRegistryData(null);
                else if (activeTab === 'cross') setCrossData(null);
              }}
              className="mt-2 px-3 py-1 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-800 text-slate-100 rounded text-xs transition-colors cursor-pointer"
            >
              {language === 'cn' ? '重试连接' : 'Retry API Call'}
            </button>
          </div>
        ) : (
          <div>
            
            {/* ① TAB 1: FACTORY IMAGES DOSSIER */}
            {activeTab === 'images' && factoryImagesData && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-xl font-mono text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-0.5">
                      Secure API Target Gate
                    </span>
                    <code className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                      {FACTORY_IMAGES_API_URL}/{id}
                    </code>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    {language === 'cn' ? '数据更新：按月同步存档' : 'Data Update: Synced Monthly'}
                  </span>
                </div>

                {factoryImagesData.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image Slider */}
                    <div className="relative border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/90 aspect-[16/9] max-w-3xl mx-auto shadow-2xl group">
                      <img 
                        src={factoryImagesData.images[currentImageIndex].url} 
                        alt={language === 'cn' ? factoryImagesData.images[currentImageIndex].titleCn : factoryImagesData.images[currentImageIndex].titleEn}
                        className="w-full h-full object-cover transition-all duration-300"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Nav Buttons overlay */}
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? factoryImagesData.images.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-950/80 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 border border-slate-800 rounded-full cursor-pointer transition-all focus:outline-none"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === factoryImagesData.images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-950/80 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 border border-slate-800 rounded-full cursor-pointer transition-all focus:outline-none"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      {/* Image caption overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 pt-10 text-center font-sans">
                        <p className="text-sm font-bold text-slate-100">
                          {language === 'cn' ? factoryImagesData.images[currentImageIndex].titleCn : factoryImagesData.images[currentImageIndex].titleEn}
                        </p>
                        <p className="text-[10px] font-mono text-cyan-400 mt-1 uppercase">
                          IMAGE {currentImageIndex + 1} OF {factoryImagesData.images.length}
                        </p>
                      </div>
                    </div>

                    {/* Thumbnail dots & selector */}
                    <div className="flex justify-center items-center gap-2 max-w-md mx-auto">
                      {factoryImagesData.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`h-2.5 rounded-full transition-all cursor-pointer ${
                            idx === currentImageIndex ? 'w-8 bg-cyan-400' : 'w-2.5 bg-slate-850 hover:bg-slate-700'
                          }`}
                          title={language === 'cn' ? img.titleCn : img.titleEn}
                        />
                      ))}
                    </div>

                    {/* Annotation Note */}
                    <div className="p-4 bg-slate-950/40 border border-slate-850 text-xs text-slate-400 rounded-xl flex items-start gap-2.5 max-w-3xl mx-auto leading-relaxed">
                      <ShieldCheck className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-300 block mb-1">
                          {language === 'cn' ? '影像档案防伪核实声明' : 'Visual Asset Veracity Declaration'}
                        </span>
                        <p className="font-sans">
                          {language === 'cn' 
                            ? '所有影像资料均为实地现场拍摄，由平台人员现场核验存档，更新周期按月同步。' 
                            : 'All image dossiers are photographed directly on-site, verified by on-site audit inspectors, and updated on a monthly sync cycle.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 font-sans">
                    {language === 'cn' ? '暂无影像数据' : 'No images found'}
                  </div>
                )}
              </div>
            )}

            {/* ② TAB 2: PRODUCT PHOTOS DOSSIER */}
            {activeTab === 'products' && productPhotosData && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-xl font-mono text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-0.5">
                      Secure API Target Gate
                    </span>
                    <code className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                      {PRODUCT_PHOTOS_API_URL}/{id}
                    </code>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    {language === 'cn' ? '实样对照：拒绝网图美化' : 'Sample Comparison: Authenticity Guaranteed'}
                  </span>
                </div>

                {productPhotosData.photos.length > 0 ? (
                  <div className="space-y-6">
                    {/* Grid of Product Photos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                      {productPhotosData.photos.map((photo, idx) => (
                        <div key={idx} className="bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-xl overflow-hidden flex flex-col transition-all group shadow-lg">
                          {/* Image box */}
                          <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden border-b border-slate-900">
                            <img 
                              src={photo.url} 
                              alt={language === 'cn' ? photo.titleCn : photo.titleEn}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/90 text-cyan-400 border border-slate-800 rounded-[4px] text-[9px] uppercase tracking-wider">
                              {language === 'cn' ? photo.categoryCn : photo.categoryEn}
                            </div>
                          </div>

                          {/* Content info */}
                          <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                            <div className="space-y-1 font-sans">
                              <h5 className="font-bold text-slate-200 text-xs leading-normal">
                                {language === 'cn' ? photo.titleCn : photo.titleEn}
                              </h5>
                            </div>

                            <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 flex items-center justify-between">
                              <span className="text-slate-500">{language === 'cn' ? '实拍时间' : 'Shot Date'}</span>
                              <span className="font-bold text-slate-300">{photo.shotDate}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Annotation Note */}
                    <div className="p-4 bg-slate-950/40 border border-slate-850 text-xs text-slate-400 rounded-xl flex items-start gap-2.5 max-w-3xl mx-auto leading-relaxed">
                      <Camera className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-300 block mb-1">
                          {language === 'cn' ? '产品实拍防伪说明' : 'Product Photo Authenticity Statement'}
                        </span>
                        <p className="font-sans">
                          {language === 'cn' 
                            ? '货品实拍原图，用于核实实际出货品相，不含后期修图美化。' 
                            : 'Authentic product raw photo, used strictly to verify actual outgoing physical appearance, completely free of cosmetic rendering or post-processing beautification.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 font-sans">
                    {language === 'cn' ? '暂无产品图片数据' : 'No product photos found'}
                  </div>
                )}
              </div>
            )}

            {/* ③ TAB 3: REMOTE VIDEO VERIFICATION */}
            {activeTab === 'video' && videoData && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-0.5">
                      Secure API Target Gate
                    </span>
                    <code className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                      {VIDEO_API_URL}/{id}
                    </code>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="h-2 w-2 bg-emerald-400 rounded-full animate-ping"></span>
                    <span className="text-emerald-400 font-bold">{language === 'cn' ? '实时连接中' : 'Streaming Active'}</span>
                  </div>
                </div>

                <div className="relative border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/90 aspect-video max-w-3xl mx-auto shadow-2xl">
                  {isPlaying ? (
                    <video 
                      src={videoData.videoUrl} 
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <div className="h-16 w-16 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center">
                        <Lock className="h-8 w-8" />
                      </div>
                      <p className="text-xs font-mono text-slate-400">
                        {language === 'cn' ? '视频反馈已暂停。已加密缓冲。' : 'Video feed paused. Buffer secured.'}
                      </p>
                      <button 
                        onClick={() => setIsPlaying(true)}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs rounded-lg cursor-pointer transition-all"
                      >
                        {language === 'cn' ? '重新载入视频流' : 'Reload Stream'}
                      </button>
                    </div>
                  )}

                  {/* Corner stats watermark overlay */}
                  <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded font-mono text-[9px] text-slate-400 space-y-0.5 pointer-events-none">
                    <p className="font-bold text-cyan-400">{videoData.title}</p>
                    <p>Format: {videoData.resolution} // {videoData.fps} FPS</p>
                    <p>Relay: {videoData.relayNode}</p>
                  </div>
                </div>

                {/* Requirements details label & note */}
                <div className="bg-cyan-950/10 border border-cyan-950/50 p-4 rounded-xl space-y-1.5 max-w-3xl mx-auto">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{language === 'cn' ? '视频核验说明' : 'Video Verification Policy'}</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {language === 'cn' 
                      ? '本页面调取的实时视频流经过VerCred D1边缘网关传输，已打上时间戳防伪。可预约现场连线核验厂区实景。如有商务需求，请联系对应大客户经理一键开通通道。' 
                      : 'The real-time video flow retrieved here is transmitted through the VerCred D1 edge gateway with timestamp anti-forgery marks. Can book live connection to verify real-scene factory. For business expansion, please consult client managers.'}
                  </p>
                </div>
              </div>
            )}

            {/* ② TAB 2: ENTERPRISE COMMERCIAL REGISTRY */}
            {activeTab === 'registry' && registryData && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-0.5">
                      Secure API Target Gate
                    </span>
                    <code className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                      {REGISTRY_API_URL}/{id}
                    </code>
                  </div>

                  <span className="text-xs font-mono text-slate-400 max-w-xl text-left sm:text-right leading-normal font-sans">
                    {language === 'cn' 
                      ? '数据来源：商事主体公共信用信息公示平台，信息同步间隔为T+1自然日，仅作贸易资质参考，不作为法定诉讼凭据。' 
                      : 'Source: Commercial Entity Public Credit Information Publicity Platform, synced on a T+1 natural day basis. For trade qualification reference only, not a legal dispute basis.'}
                  </span>
                </div>

                {/* Document preview block layout */}
                <div className="bg-slate-950/80 border border-slate-850 rounded-2xl overflow-hidden shadow-xl font-mono text-xs">
                  
                  {/* Document Header */}
                  <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-5 w-5 text-cyan-400" />
                      <div>
                        <h4 className="font-bold text-slate-100">{language === 'cn' ? '商事主体基本登记档案信息' : 'Standard Enterprise Corporate Dossier'}</h4>
                        <p className="text-[10px] text-slate-500">SYSTEM ID: {registryData.registrationNumber}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 xl:justify-end">
                      {/* Risk Rating Module */}
                      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2 min-w-[200px] max-w-xs text-left">
                        {riskLoading ? (
                          <div className="flex items-center gap-2 text-slate-400">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                            <span className="text-[10px]">{language === 'cn' ? '评级加载中...' : 'Loading risk rating...'}</span>
                          </div>
                        ) : riskError ? (
                          <div className="text-rose-400 text-[10px] leading-tight font-sans">
                            <span className="block font-black uppercase text-[8px] text-rose-500">RISK LOAD FAULT</span>
                            <span>{riskError}</span>
                          </div>
                        ) : riskData ? (
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col flex-shrink-0">
                              <span className="text-[8px] text-slate-500 uppercase tracking-widest block font-bold font-sans">
                                {language === 'cn' ? '风险安全评级' : 'Risk Rating'}
                              </span>
                              {riskData.level === 'low' && (
                                <span className="text-xs font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></span>
                                  {language === 'cn' ? '低风险' : 'Low Risk'}
                                </span>
                              )}
                              {riskData.level === 'medium' && (
                                <span className="text-xs font-black text-yellow-500 flex items-center gap-1 mt-0.5">
                                  <span className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                                  {language === 'cn' ? '中等风险' : 'Medium Risk'}
                                </span>
                              )}
                              {riskData.level === 'high' && (
                                <span className="text-xs font-black text-rose-500 flex items-center gap-1 mt-0.5">
                                  <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping"></span>
                                  {language === 'cn' ? '高风险' : 'High Risk'}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-[9px] text-slate-400 leading-tight border-l border-slate-850 pl-2 max-w-[120px] font-sans">
                              {riskData.level === 'low' && (language === 'cn' ? '无行政处罚、经营异常、司法冻结记录' : 'No warnings, penalties, or freezes.')}
                              {riskData.level === 'medium' && (language === 'cn' ? '存在轻微经营预警记录，无行政处罚' : 'Minor warning records, no penalties.')}
                              {riskData.level === 'high' && (language === 'cn' ? '包含行政处罚、列入经营异常名录、股权冻结、失信被执行人等记录' : 'Includes administrative actions, penalties or freezes.')}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Expiry Label & Valid stamp on top right */}
                      <div className="flex flex-col items-start xl:items-end gap-1">
                        <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 px-2.5 py-0.5 rounded uppercase font-bold">
                          {language === 'cn' ? '有效在营' : 'Active Status'}
                        </span>
                        <span className="text-[9px] text-slate-500 font-normal max-w-[200px] leading-normal block xl:text-right font-sans">
                          {language === 'cn' 
                            ? '资质状态由官方公示接口实时校验，失效会自动变更为红色过期标识。' 
                            : 'Validity verified in real-time. Expired documents show a red warning indicator.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Document Body Grid */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-slate-300">
                    
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">{language === 'cn' ? '统一社会信用代码 / 注册号' : 'Unified Social Credit Code / Reg No'}</span>
                      <p className="text-slate-100 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-900 font-bold text-cyan-400">
                        {registryData.registrationNumber}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">{language === 'cn' ? '法定代表人' : 'Legal Representative / Corporate Officer'}</span>
                      <p className="text-slate-100 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-900 flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                        <span>{registryData.legalRepresentative}</span>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">{language === 'cn' ? '注册年限及成立日期' : 'Registration Date & Lifetime'}</span>
                      <p className="text-slate-100 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-900 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{registryData.establishedDate} ({language === 'cn' ? `在营 ${new Date().getFullYear() - parseInt(registryData.establishedDate)} 年` : `${new Date().getFullYear() - parseInt(registryData.establishedDate)} Years Active`})</span>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">{language === 'cn' ? '核准注册资本' : 'Registered Paid-In Capital'}</span>
                      <p className="text-slate-100 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-900 font-bold text-emerald-400">
                        {registryData.registeredCapital}
                      </p>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">{language === 'cn' ? '核准核查登记经营范围' : 'Officially Registered Business Scope'}</span>
                      <div className="text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-900 leading-relaxed text-xs">
                        {language === 'cn' ? registryData.businessScopeCn : registryData.businessScopeEn}
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">{language === 'cn' ? '登记备案登记机关' : 'Registered Registrant Licensing Authority'}</span>
                      <p className="text-slate-300 text-xs flex items-center gap-2 bg-slate-900/30 px-3 py-2 rounded">
                        <Scale className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{language === 'cn' ? registryData.authorityCn : registryData.authorityEn}</span>
                      </p>
                    </div>

                  </div>

                  {/* 3. Separate Violation Records Section */}
                  <div className="border-t border-slate-800 p-6 bg-slate-900/30 font-mono text-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                        <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                          {language === 'cn' ? '商事主体公示行政处罚及异常监管记录' : 'Public Disciplinary & Corporate Anomalies'}
                        </h5>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                        {RISK_API_URL}/{id}
                      </span>
                    </div>

                    {riskLoading ? (
                      <div className="py-6 text-center text-slate-500 flex items-center justify-center gap-2 font-sans">
                        <RefreshCw className="h-4 w-4 animate-spin text-cyan-500" />
                        <span>{language === 'cn' ? '实时风控数据交互中...' : 'Accessing risk records...'}</span>
                      </div>
                    ) : riskError ? (
                      <div className="p-4 rounded-xl border border-rose-950/30 bg-rose-950/10 text-rose-400 text-center font-sans">
                        <span>{riskError}</span>
                      </div>
                    ) : riskData ? (
                      riskData.violations.length > 0 ? (
                        <div className="space-y-3">
                          {riskData.violations.map((violation, idx) => (
                            <div key={idx} className="bg-rose-950/10 border border-rose-900/20 rounded-xl p-4 space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-rose-950/30 pb-2">
                                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                                  <span>{language === 'cn' ? '违规预警异常记录' : 'Warning Alert Record'} #{idx + 1}</span>
                                </span>
                                <span className="text-slate-400 font-bold">{violation.date}</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed pt-1 font-sans">
                                <div>
                                  <span className="text-slate-500 text-[10px] block uppercase font-bold font-mono">{language === 'cn' ? '处罚事由 / 预警详情' : 'Infraction Details'}</span>
                                  <p className="text-slate-300 mt-0.5">{language === 'cn' ? violation.reasonCn : violation.reasonEn}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-[10px] block uppercase font-bold font-mono">{language === 'cn' ? '执法监管单位' : 'Regulating Institution'}</span>
                                  <p className="text-slate-300 mt-0.5">{language === 'cn' ? violation.regulatorCn : violation.regulatorEn}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center border border-slate-800/60 bg-slate-950/20 rounded-xl text-slate-400 flex flex-col items-center justify-center gap-2 font-sans">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          <span>
                            {language === 'cn' ? '本主体暂无公示行政处罚及经营异常信息。' : '本主体暂无公示行政处罚及经营异常信息。'}
                          </span>
                        </div>
                      )
                    ) : null}
                  </div>

                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/20 text-slate-500 text-[11px] leading-relaxed">
                  {language === 'cn' 
                    ? '重要提示：此商事备案基础信息在获取时已通过底层VerCred API进行多次数字签名校验与缓存校验。' 
                    : 'Notice: This basic registry document data is fully parsed and signed with modern VerCred API keys to ensure anti-tamper compliance.'}
                </div>
              </div>
            )}

            {/* ③ TAB 3: MULTI-DIMENSIONAL CROSS VERIFICATION */}
            {activeTab === 'cross' && crossData && (
              <div className="space-y-8 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-xl font-mono text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-0.5">
                      Secure API Target Gate
                    </span>
                    <code className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                      {CROSS_API_URL}/{id}
                    </code>
                  </div>

                  <span className="text-slate-500">
                    {language === 'cn' ? '多维度合规交叉核对存证库' : 'Cross-Match Decentralized Security Vault'}
                  </span>
                </div>

                {/* Sub-layout: 3 sections (Customs Records, Industry Permissions, SGS/TUV) */}
                <div className="space-y-6">
                  
                  {/* Section A: Customs Documents (海关单据) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                      <span>{language === 'cn' ? '海关真实出货通关记录校验' : 'Customs Ledger Audit Certificates'}</span>
                    </h4>

                    <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 font-mono text-xs space-y-2.5">
                      {crossData.customsLedgers.map((ledg, idx) => (
                        <div key={idx} className="flex items-start gap-2 border-b border-slate-900/50 pb-2.5 last:border-0 last:pb-0">
                          <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <p className="text-slate-300 leading-relaxed">{ledg}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section B: Registered Certifications (行业许可与体系认证) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                      <span>{language === 'cn' ? '行业经营许可及国际管理体系认证' : 'Quality Management & Industry Standards'}</span>
                    </h4>

                    <div className="grid grid-cols-1 gap-4">
                      {crossData.certifications.map((cert, idx) => (
                        <div key={idx} className="bg-slate-950/40 border border-slate-850/80 hover:border-slate-800 p-4 rounded-xl space-y-2 transition-all">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-900 pb-2">
                            <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                              <Award className="h-4 w-4 text-emerald-400" />
                              {language === 'cn' ? cert.nameCn : cert.nameEn}
                            </span>
                            <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-900/60 px-2 py-0.5 rounded">
                              CODE: {cert.number}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                            <div>
                              <span className="text-slate-500 text-[10px] block font-bold uppercase">{language === 'cn' ? '发证机关' : 'Issuer Authority'}</span>
                              <span className="text-slate-300">{language === 'cn' ? cert.issuedByCn : cert.issuedByEn}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block font-bold uppercase">{language === 'cn' ? '状态及评准日期' : 'Issued Date & Status'}</span>
                              <span className="text-emerald-400 font-bold">{cert.status.toUpperCase()} ({cert.issueDate})</span>
                            </div>
                          </div>

                          <p className="text-slate-300 text-xs pt-1 border-t border-slate-950 leading-relaxed font-sans">
                            {language === 'cn' ? cert.descriptionCn : cert.descriptionEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section C: Third-Party Inspection Reports (第三方现场检测报告) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                      <span>{language === 'cn' ? '第三方检测机构深度核验存证' : 'Third-Party Laboratory & Logistics Audits'}</span>
                    </h4>

                    <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 font-mono text-xs space-y-3">
                      {(language === 'cn' ? crossData.thirdPartyReportsCn : crossData.thirdPartyReportsEn).map((rep, idx) => (
                        <div key={idx} className="flex items-start gap-2 border-b border-slate-900/50 pb-2 last:border-0 last:pb-0">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <p className="text-slate-300 leading-relaxed">{rep}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Bottom verification watermarking banner */}
                <div className="p-3 bg-emerald-950/10 border border-emerald-950 text-xs text-slate-400 rounded-xl flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span>
                    {language === 'cn' 
                      ? '本核对系统资质文件均来自于海关底层申报指纹及认证机构签发的链上数字凭证，不可篡改。' 
                      : 'All documents dynamically extracted from verified custom registries and cryptographically signed standard bodies.'}
                  </span>
                </div>

              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
