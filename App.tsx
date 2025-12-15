
import React, { useState, useRef, useEffect } from 'react';
import { User, Role, Language, DICTIONARY, ImageState, TranslationKey } from './types';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { geminiService } from './services/geminiService';
import { authService } from './services/authService';

// Icons
const IconUndo = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>;
const IconRedo = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15 21 9m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" /></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const IconRefresh = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>;
const IconSparkles = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>;
const IconRotate = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const IconPhoto = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>;
const IconUpload = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>;
const IconUploadLarge = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>;
const IconKey = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>;
const IconLightning = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.981 9.75h7.263a.75.75 0 0 1 .53 1.28l-15.39 12.024a.75.75 0 0 1-1.187-.806l2.355-8.248H.75a.75.75 0 0 1-.53-1.28L11.96 1.012a.75.75 0 0 1 .808-.053l1.847.636Z" clipRule="evenodd" /></svg>;
const IconStar = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg>;
const IconExternalLink = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>;

const IconBrandLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 md:w-8 md:h-8 text-brand-blue drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]">
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813a3.75 3.75 0 0 0 2.576-2.576l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258c.94-.236 1.674-.97 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5M16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.394a.75.75 0 0 1 0 1.422l-1.183.394c-.447.15-.799.5-.948.948l-.394 1.183a.75.75 0 0 1-1.422 0l-.394-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.394a.75.75 0 0 1 0-1.422l1.183-.394c.447-.15.799-.5.948-.948l.394-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
  </svg>
);

const STYLE_PRESETS = [
  {
    label: "Modern Minimalist",
    value: `A wide-angle architectural photograph of a luxurious modern minimalist building, viewed from the far end of its backyard under a bright clear blue sky. The two-story structure is characterized by clean white cubic forms, large floor-to-ceiling glass windows, and glass balcony railings. A long rectangular swimming pool with clear turquoise water runs parallel to the entire length of the building's main facade. A large, manicured green lawn area is situated to the left of the pool, and a wide paved walkway made of large light-colored stone tiles borders the pool on all other sides. Several wooden sun loungers with white cushions are arranged on the poolside patio on the right. A covered outdoor lounge area with furniture is integrated into the ground floor of the building. The landscaping features mature palm trees and various tropical plants, creating a serene and luxurious resort-like atmosphere. Bright midday sunlight casts sharp shadows.`
  },
  {
    label: "Backyard Landscape",
    value: `A wide-angle landscape photograph focusing on the luxurious backyard area of a modern property, not emphasizing the building itself. A long, rectangular swimming pool with clear turquoise water runs parallel to the main facade in the background. A wide paved walkway made of large light-colored stone tiles borders the entire length of the pool on the right side, featuring several white modern sun loungers. To the left of the pool is a perfectly manicured green lawn area. The landscape is adorned with mature palm trees and various lush tropical plants, creating a serene, high-end resort atmosphere. Bright midday natural sunlight casts sharp shadows, highlighting the textures of the stone and water under a clear blue sky. The style is contemporary and minimalist.`
  },
  {
    label: "Rice Paddy Villa",
    value: `A photorealistic architectural photograph of a [INSERT BUILDING TYPE HERE] situated on an elevated foundation above a flooded green rice paddy field. The water is calm, perfectly reflecting the structure and the clear blue sky with scattered fluffy white clouds. Lush, vibrant green rice plants fill the surrounding fields, with grassy banks and reeds. Bright, natural daylight illuminates the scene. The background shows a distant rural landscape with trees under a wide sky. High resolution, incredibly detailed textures, natural colors, peaceful atmosphere.`
  },
  {
    label: "Suburban House (บ้านจัดสรรค์)",
    value: `A wide-angle architectural photograph of a [Insert Building Type], [Insert Style], situated in an upscale luxury suburban neighborhood. The foreground features a spacious, clean paved asphalt driveway leading up to the structure. The building is surrounded by perfectly manicured landscape design, low trimmed hedges, ornamental shrubs, needle pine trees, and a lush green lawn. The sky is a clear, smooth gradient blue with soft natural daylight. Warm, welcoming yellow light glows from the windows, contrasting with the cool twilight sky. Ultra-realistic, 8k resolution, sharp focus, clean composition, premium real estate photography style.`
  },
  {
    label: "European Estate (บ้านยุโรป)",
    value: `A grand architectural photograph of a [Insert Building Type], situated in an opulent formal formal French garden estate. A long, elegant light-beige cobblestone paved driveway leads centrally towards the structure. The foreground is dominated by perfectly manicured geometric boxwood hedges, low-trimmed garden mazes, and symmetrical cone-shaped cypress trees flanking the path. Lush vibrant green lawns. The sky is a dramatic mix of blue and soft textured white clouds. Soft, diffused natural daylight. High-end real estate photography, hyper-realistic, 8k resolution, symmetry, wealth and elegance.`
  },
  {
    label: "Woodland Garden (สวนสีเขียว)",
    value: `A photorealistic architectural photograph of a [Insert Building Type], nestled in a lush, mature woodland garden. A winding light-grey flagstone pathway leads through a vibrant green lawn towards the entrance. The foreground is filled with rich, textured landscaping including ferns, hostas, and low-growing shrubs. Tall, mature trees frame the scene, creating a natural canopy overhead. Soft, diffused natural daylight illuminates the exterior, while warm golden interior lights glow invitingly from the windows, creating a cozy and serene atmosphere. High resolution, 8k, sharp focus, harmonious with nature`
  },
  {
    label: "Rice Field Aerial (มุมเบิร์ดอายวิว)",
    value: `A stunning architectural photograph of a [Insert Building Type], situated in the middle of vast, vibrant green rice paddy fields. In the background, a majestic, layering mountain range stretches across the horizon under a bright blue sky with fluffy white clouds. A long, straight paved concrete driveway leads from the foreground gate towards the building, flanked by manicured green lawns and the rice fields. The scene is bathed in bright, clear natural sunlight. High contrast, vivid colors, photorealistic, 8k resolution, wide-angle shot, peaceful countryside atmosphere.`
  },
  {
    label: "Lake & Mountain View (วิวทะเลสาบ)",
    value: `Defining the Setting: I'm currently focused on meticulously describing the atmosphere and landscape derived from the original image, aiming to craft a realistic, detailed scene suitable as a backdrop for various architectural designs. This involves pinpointing specific elements: the high-angle perspective, the bright, warm sunlight with sharp shadows, and a vibrant blue sky dotted with fluffy white clouds. I'm also considering the rugged terrain, snow-capped peaks, forested slopes, and the large, reflective, deep blue lake. Refining the Details: I'm now refining the description of the scene's elements. I'm focusing on incorporating more precise language, drawing from the original. This includes the aerial perspective, the bright, sharp sunlight casting shadows, and the vibrant blue sky with scattered clouds. I'm also considering the rugged mountainous terrain with snow-capped peaks, the forested slopes, and the large, reflective deep blue lake. Finally, I'm noting the meticulously landscaped hillside with its green lawns, carefully placed shrubs and flowers, the stone pathways, and the clear blue swimming pool with its surrounding sun deck. Analyzing the Results: I've examined the results closely. The output aligns perfectly with the client's specifications. It is a high-quality photograph, capturing the ambiance, mountains, lake, and pool present in the original reference. The building has been completely removed and replaced with a natural-looking garden. I'm satisfied with the current state and will submit it to the client.`
  },
  {
    label: "Resort Twilight (บ้านเจนนี่)",
    value: `High-resolution photograph of a resort or residential project area in the dusk or dawn, blue-grey sky with wispy clouds. Meticulously designed and maintained gardens filled with lush greenery, large shade trees, pine trees, shrubs, colorful flowering plants, and ground covers. Concrete or stone walkways winding through the garden. Water features or swimming pools with clear water reflecting the sky. In the background, Modern architecture, single-detached houses, villas, or clubhouse, mixing materials like concrete, stone, wood, and glass. Large windows letting in natural light and warm lighting used in some areas. Asphalt or concrete roads within the project, clean and organized, with light from garden lights or building lights creating brightness and dimension.`
  },
  {
    label: "Mountain Village (ไหล่เขามีต้นไม้)",
    value: `Conceptualizing the Scene: I'm currently focused on the overarching scene. My goal is to capture a vibrant mountain landscape teeming with lush, green forests and expansive meadows under a bright, cloud-dotted sky. I'm envisioning the integration of a diverse range of buildings into this natural setting. Expanding Architectural Variety: I'm now integrating architectural diversity into the design. My aim is to replace a single house with a collection of structures. These buildings will include modern tropical elements with materials like thatch or flat roofs, large glass panels, stone, and wood. I'm focusing on arranging these structures across the hillside and incorporating features such as infinity pools, terraces, wooden walkways, and pavilions to enhance the scene. I also plan to add more details about the surrounding vegetation. Analyzing Visual Transformations: I've examined the visual transformations, specifically noting the expansion of a single building into a diverse resort village. The imagery accurately reflects modern structures and thatched cottages, with a high level of detail consistent with the specified ambiance. This output perfectly meets the client's expectations, and I'm ready to proceed.`
  },
  {
    label: "Lake Reflection (วิวหลังเขาหน้าทะเลสาบ)",
    value: `8K resolution landscape photograph showing a tranquil and fresh atmosphere of a waterfront area. Foreground is a large swamp or lake with perfectly still, mirror-like water reflecting the sky and surrounding landscape perfectly. The banks are spacious, neatly trimmed green lawns alternating with gravel paths and natural stones. Background is a lush rainforest and large high mountains covered in green trees. The sky has scattered clouds, providing soft lighting throughout the image. The center of the image reserves space for a "building" (which can be a wooden house, glass building, or modern building) to blend with nature and the reflection in the water.`
  },
  {
    label: "Forest Hill Reflection (เนินเขาป่าไม้)",
    value: `High-resolution landscape photograph emphasizing the tranquility and grandeur of nature. Foreground is fresh green lawn, well-maintained and trimmed, sloping down to the edge of a large lake. The water surface is perfectly still like a mirror, reflecting the surrounding scenery perfectly. Background is majestic high mountains covered with dense lush green rainforest. Some beautiful large trees stand at the water's edge to frame the image. Diffused light or soft morning sunlight makes the atmosphere look soft and fresh. The sky is slightly cloudy or has beautiful scattered clouds. At a suitable position by the lake, there is a building [Insert Building Type Here: Modern vacation home / Log cabin / Pavilion] situated harmoniously with the environment.`
  },
  {
    label: "Khao Yai Modern (เขาใหญ่)",
    value: `A photorealistic architectural photograph of a two-story modern house with a distinctive design. The exterior walls blend exposed concrete and black structures with wooden slats to create a warm feeling harmonious with nature. Large clear glass panels from floor to ceiling reveal modern interior decoration. The house is situated amidst lush natural landscape. Background is a dense mountain range. In front, there is a reflecting pool, a smooth wide lawn, and a garden of various flowers. Morning natural sunlight hits, creating a quiet and luxurious atmosphere.`
  },
  {
    label: "Khao Yai Resort (เขาใหญ่ 2)",
    value: `Imagining the Scene: I'm visualizing a modern resort built of stone and wood, nestled in lush greenery. I see a tranquil atmosphere, a wide lawn bordered by white and purple flowering plants. A pool reflects the building. Large trees, including mango trees with supports, provide shade. A forested mountain forms the backdrop, and afternoon sunlight bathes the scene in a relaxing ambiance. Analyzing Details Precisely: I've meticulously reviewed the provided image and confirmed its perfect alignment with the original request. Every detail, from the tranquil ambiance and diverse flora to the lush green lawn and exquisite landscaping, aligns precisely with the user's specifications. This thorough analysis ensures its usability as a template for future iterations. The outcome meets all stated requirements, and I'm prepared to deliver this output.`
  },
  {
    label: "Pool Villa Twilight (บ้านริมสระพลบค่ำ)",
    value: `A cinematic, photorealistic architectural landscape photograph of a luxurious resort villa at twilight (Blue Hour). Foreground & Outdoor Living (Primary Focus): The foreground features a sleek, dark-tiled swimming pool with still water creating perfect, mirror-like reflections of the warm lights. A spacious wooden deck surrounds the pool. The outdoor living area includes built-in lounge seating with plush cushions, a dining area with a large parasol, and wide stone steps leading up to the residence. Lighting & Atmosphere: The scene is illuminated by a cozy, warm golden glow coming from numerous floor lanterns placed on the steps and pool edge, as well as the interior lighting. This warm light contrasts beautifully with the cool deep blue tones of the twilight sky. The mood is intimate, inviting, and expensive. The Architecture (Variable Element): Overlooking the pool deck is a wide, expansive luxury residence. (Note to AI: The architecture can be any style—Modern Tropical, Contemporary Flat Roof, or Classic Resort Style with a pitched roof—provided it features an open-concept design with massive sliding glass doors that are fully open, revealing a warm, illuminated interior). Background: The backdrop is a dense, lush green hillside covering the horizon, providing a natural and secluded setting. 8k resolution, architectural photography style.`
  }
];

const IMAGE_STYLES: { labelKey: TranslationKey; value: string }[] = [
  { labelKey: 'stylePhoto', value: 'Photorealistic style, 8k, highly detailed' },
  { labelKey: 'styleOil', value: 'Oil painting style, textured brushstrokes, artistic' },
  { labelKey: 'stylePencil', value: 'Pencil sketch style, graphite on paper, monochrome' },
  { labelKey: 'styleMagic', value: 'Magic marker drawing style, vibrant colors, bold lines' },
  { labelKey: 'styleColorPencil', value: 'Colored pencil drawing style, soft textures, artistic' },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>(Language.TH); // Default TH
  const [showAdmin, setShowAdmin] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // App State
  const [mainPrompt, setMainPrompt] = useState('');
  const [refinePrompt, setRefinePrompt] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null); // Track active preset
  const [activeStyle, setActiveStyle] = useState<string | null>(null);   // Track active style

  // Model Selection State (False = Standard/Free/Flash, True = Pro/2K)
  const [useProModel, setUseProModel] = useState(false);

  const [presetsOpen, setPresetsOpen] = useState(false);
  const [imageStyleOpen, setImageStyleOpen] = useState(false);
  
  // Image History Stack
  const [history, setHistory] = useState<ImageState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Reference Image (Separate from history)
  const [referenceImage, setReferenceImage] = useState<{data: string, mime: string} | null>(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);
  const mainPromptInputRef = useRef<HTMLTextAreaElement>(null);

  const t = DICTIONARY[lang];

  // --- Handlers ---

  const handleLogout = () => {
    setUser(null);
    setHistory([]);
    setHistoryIndex(-1);
    setReferenceImage(null);
    setMainPrompt('');
    setRefinePrompt('');
    setActivePreset(null);
    setActiveStyle(null);
  };

  // Background Session Checker (Now using Real-time Listener)
  useEffect(() => {
    if (!user) return;

    // Listen to real-time changes on the user document
    const unsubscribe = authService.listenToUserSession(user.id, (userData) => {
        if (!userData) {
            // Document deleted
            handleLogout();
            alert("Your account has been deleted.");
            return;
        }

        const isSessionValid = 
            userData.isActive && 
            userData.sessionToken === user.sessionToken &&
            (!userData.expiryDate || new Date(userData.expiryDate) > new Date());

        if (!isSessionValid) {
            handleLogout();
            alert(lang === Language.TH 
                ? "เซสชั่นหมดอายุหรือมีการเปลี่ยนแปลงข้อมูลบัญชี กรุณาเข้าสู่ระบบใหม่" 
                : "Session expired or credentials changed. Please login again.");
        }
    });

    return () => {
      unsubscribe();
    };
  }, [user, lang]);

  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setReferenceImage({
          data: base64,
          mime: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    if (refFileInputRef.current) refFileInputRef.current.value = '';
  };

  const handleMainPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMainPrompt(e.target.value);
    // If user types manually, clear the active preset indicator
    if (activePreset) setActivePreset(null);
  };

  // Upload main image from center screen
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const newImg: ImageState = {
          data: base64,
          mimeType: file.type,
          id: `orig-${Date.now()}`,
          timestamp: Date.now()
        };
        setHistory([newImg]);
        setHistoryIndex(0);
        setRotation(0);
        setFlipH(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    // 1. Client-side Check (Basic)
    if (!user) return;
    
    setLoading(true);
    try {
      const effectivePrompt = historyIndex > 0 && refinePrompt ? refinePrompt : mainPrompt;
      
      // Allow generation if reference image exists but prompt is empty (Auto-Blend Mode)
      let promptToSend = effectivePrompt;
      if (!promptToSend && referenceImage) {
         promptToSend = "Apply the style, lighting, and atmosphere of the reference image to the main image.";
      } else if (!promptToSend) {
        alert("Please enter a prompt or upload a reference image.");
        setLoading(false);
        return;
      }

      // Logic to determine images: We now support BOTH Main Image AND Reference Image simultaneously
      const currentResult = history[historyIndex]; // Main image (current state)
      
      const mainImg = currentResult ? currentResult.data : undefined;
      const mainMime = currentResult ? currentResult.mimeType : undefined;

      const refImg = referenceImage ? referenceImage.data : undefined;
      const refMime = referenceImage ? referenceImage.mime : undefined;

      // Pass everything to service
      const generatedBase64 = await geminiService.generateImage(
          promptToSend, 
          mainImg, 
          mainMime,
          refImg,
          refMime,
          useProModel // Pass the user's choice
      );

      const newImgState: ImageState = {
        data: generatedBase64,
        mimeType: 'image/png',
        id: `gen-${Date.now()}`,
        timestamp: Date.now()
      };

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newImgState);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      if (historyIndex >= 0) setRefinePrompt('');

    } catch (error: any) {
      console.error(error);
      if (error.message && error.message.includes("API_KEY_MISSING")) {
         // Open modal instead of just alert
         setShowKeyModal(true);
      } else {
         // Show more details if possible, or just the error
         alert(`Failed to generate: ${error.message || "Unknown error"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpscale4K = async () => {
    // 1. Session Validation
    if (!user) return;
    
    const currentImg = history[historyIndex];
    if (!currentImg) return;
    
    setLoading(true);
    try {
      const upscaledBase64 = await geminiService.upscaleImage4K(currentImg.data, currentImg.mimeType);
      
       const newImgState: ImageState = {
        data: upscaledBase64,
        mimeType: 'image/png',
        id: `upscale-${Date.now()}`,
        timestamp: Date.now()
      };
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newImgState);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
    } catch (error: any) {
      if (error.message && error.message.includes("API_KEY_MISSING")) {
         setShowKeyModal(true);
      } else {
         alert("Upscale failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1);
    }
  };

  const handleResetToOriginal = () => {
     if (history.length > 0) {
         setHistoryIndex(0);
         setRotation(0);
         setFlipH(false);
     }
  };

  const handleNewProject = () => {
    // 1. Clear Data
    setHistory([]);
    setHistoryIndex(-1);
    setReferenceImage(null);
    setMainPrompt('');
    setRefinePrompt('');
    
    // 2. Reset UI States & Toggles
    setActivePreset(null);
    setActiveStyle(null);
    setRotation(0);
    setFlipH(false);
    setUseProModel(false); // Reset to Free
    setPresetsOpen(false);
    setImageStyleOpen(false);
    setLoading(false);
    
    // 3. Reset DOM Inputs directly to ensure UI clears if refs persist
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (refFileInputRef.current) refFileInputRef.current.value = '';
    // mainPromptInputRef is now controlled, so setting state is enough
  };

  const downloadImage = () => {
    const currentImg = history[historyIndex];
    if (!currentImg) return;
    
    const link = document.createElement('a');
    link.href = `data:${currentImg.mimeType};base64,${currentImg.data}`;
    link.download = `perpect-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const applyPreset = (p: typeof STYLE_PRESETS[0]) => {
     if (activePreset === p.label) {
        // Deselect logic
        setActivePreset(null);
        setMainPrompt(prev => {
            // Remove preset text from prompt
            let res = prev.replace(p.value, '').trim();
            if (res.startsWith(',')) res = res.substring(1).trim();
            return res;
        });
        return;
     }

     setMainPrompt(p.value);
     setActivePreset(p.label);
     setActiveStyle(null); // Clear style if new preset selected
     if (mainPromptInputRef.current) mainPromptInputRef.current.value = '';
  }

  const applyImageStyle = (s: typeof IMAGE_STYLES[0]) => {
    if (activeStyle === s.labelKey) {
        // Deselect logic
        setActiveStyle(null);
        setMainPrompt(prev => {
            // Try removing with comma first (style is usually appended)
            let res = prev.replace(`, ${s.value}`, '');
            if (res === prev) {
                 // Try removing if it was at start or without comma space
                 res = res.replace(`${s.value}, `, '');
                 if (res === prev) {
                     res = res.replace(s.value, '');
                 }
            }
            return res.trim();
        });
        return;
    }

    setMainPrompt((prev) => {
        const clean = prev.trim();
        // Prevent dupes
        if (clean.includes(s.value)) return clean;
        return clean ? `${clean}, ${s.value}` : s.value;
    });
    setActiveStyle(s.labelKey); // Use key as identifier
  };

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setShowKeyModal(false);
    alert("API Key saved successfully!");
  };

  // --- Render ---

  if (!user) {
    return <Login onLogin={setUser} lang={lang} />;
  }

  const currentImage = history[historyIndex];

  return (
    <div className="flex flex-col h-screen bg-brand-dark text-white font-sans">
      
      {/* --- Header --- */}
      <header className="h-16 bg-brand-panel border-b border-gray-700 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3 px-2 py-2">
            <IconBrandLogo />
            <div className="text-2xl font-black text-brand-blue tracking-widest">Professional AI</div>
        </div>
        
        {/* Top Center Controls */}
        <div className="flex gap-4">
          <button onClick={handleResetToOriginal} disabled={historyIndex <= 0} className="text-gray-300 hover:text-white text-xs flex items-center gap-1 disabled:opacity-50">
            <IconRefresh /> {t.reset}
          </button>
          <button onClick={handleNewProject} className="text-gray-300 hover:text-white text-xs flex items-center gap-1">
             <span className="text-lg">+</span> {t.newProject}
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
           {/* API Key Group */}
           <div className="flex items-center gap-2">
             <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] bg-brand-blue/20 text-blue-200 border border-brand-blue/40 px-2 py-1 rounded hover:bg-brand-blue/40 transition-colors"
             >
                Get Key
                <IconExternalLink />
             </a>
             {/* API Key Button */}
             <button 
               onClick={() => setShowKeyModal(true)}
               className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600"
               title="Set API Key"
             >
               <IconKey />
               <span>API Key</span>
             </button>
           </div>

          <button 
            onClick={() => setLang(lang === Language.TH ? Language.EN : Language.TH)}
            className="text-xs font-bold bg-black/40 px-2 py-1 rounded hover:bg-black/60 border border-gray-600"
          >
            {lang}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Hi, {user.username}</span>
            {user.role === Role.ADMIN && (
               <button onClick={() => setShowAdmin(true)} className="text-[10px] bg-blue-700 hover:bg-blue-600 px-2 py-1 rounded">Admin</button>
            )}
            <button onClick={handleLogout} className="text-[10px] bg-red-900/50 hover:bg-red-900 text-red-200 px-2 py-1 rounded">
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* --- Sidebar (Left) --- */}
        <aside className="w-[300px] bg-brand-panel border-r border-gray-700 flex flex-col p-3 z-10 shadow-lg">

          {/* Model Toggle Switch (New Feature) */}
          <div className="mb-4 bg-black/40 p-1 rounded-lg flex border border-gray-600">
            <button
              onClick={() => setUseProModel(false)}
              className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${
                !useProModel 
                  ? 'bg-green-600 text-white shadow shadow-green-900' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
               <IconLightning />
               Standard (Free)
            </button>
            <button
              onClick={() => setUseProModel(true)}
              className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${
                useProModel 
                  ? 'bg-brand-blue text-white shadow shadow-blue-900' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
               <IconStar />
               Pro (2K)
            </button>
          </div>

          {/* Main Prompt */}
          <div className="mb-3">
            <label className="text-[10px] text-brand-blue font-bold uppercase mb-1 block">{t.mainPrompt}</label>
            <textarea 
              ref={mainPromptInputRef}
              value={activePreset ? '' : mainPrompt}
              className="w-full bg-black/30 border border-gray-600 rounded p-2 text-xs text-white resize-none h-20 focus:border-brand-blue focus:outline-none placeholder-gray-600 leading-relaxed"
              placeholder={activePreset ? `Preset active: ${activePreset} (Type to override)` : "Prompt..."}
              onChange={handleMainPromptChange}
            />
          </div>

          {/* Additional Prompt */}
          <div className="mb-3">
            <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">{t.refinePrompt}</label>
            <textarea 
              className="w-full bg-black/30 border border-gray-600 rounded p-2 text-xs text-white resize-none h-12 focus:border-brand-blue focus:outline-none leading-relaxed"
              placeholder=""
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
            />
          </div>

          {/* Reference Image Upload */}
          <div className="mb-3">
             <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">{t.uploadRef}</label>
             <input 
                type="file" 
                accept="image/*"
                ref={refFileInputRef}
                onChange={handleRefImageUpload}
                className="hidden"
             />
             {!referenceImage ? (
                <button 
                  onClick={() => refFileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:text-brand-blue hover:border-brand-blue transition-all bg-black/20"
                >
                  <IconPhoto />
                  <span className="text-[10px] mt-1 font-bold">+ Add Image</span>
                </button>
             ) : (
                <div 
                  className="relative w-full h-28 rounded-lg overflow-hidden border border-gray-600 bg-black group cursor-pointer hover:border-brand-blue transition-all"
                  onClick={() => refFileInputRef.current?.click()}
                  title="Click to change"
                >
                  <img 
                      src={`data:${referenceImage.mime};base64,${referenceImage.data}`} 
                      className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" 
                      alt="Ref" 
                  />
                  {/* Remove Button (Overlaid) */}
                  <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          removeReferenceImage();
                      }}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1.5 transition-all shadow-md z-10"
                      title="Remove"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                  </button>
                  {/* Change Label Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 py-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                     <span className="text-[10px] text-white font-medium">Click to Change</span>
                  </div>
                </div>
             )}
          </div>

          {/* Image Styles Accordion */}
          <div className="mb-2 border-t border-gray-700 pt-2">
             <button 
                onClick={() => setImageStyleOpen(!imageStyleOpen)}
                className="flex items-center justify-between w-full text-left text-xs font-bold text-gray-300 hover:text-white mb-1"
             >
                <span>{t.imageStyle}</span>
                <span className="text-[10px]">{imageStyleOpen ? '-' : '+'}</span>
             </button>
             
             {imageStyleOpen && (
               <div className="pl-1 mt-1 space-y-1">
                   <div className="grid grid-cols-1 gap-1">
                      {IMAGE_STYLES.map((s, i) => (
                        <button 
                          key={i}
                          onClick={() => applyImageStyle(s)}
                          className={`flex items-center gap-2 text-left text-[11px] p-2 rounded-md border transition-all shadow-sm ${
                            activeStyle === s.labelKey 
                                ? 'bg-brand-blue text-white border-brand-blue' 
                                : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-brand-blue'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              activeStyle === s.labelKey ? 'border-white bg-white' : 'border-gray-500'
                          }`}>
                              {activeStyle === s.labelKey && <div className="w-1.5 h-1.5 rounded-full bg-brand-blue"></div>}
                          </div>
                          {t[s.labelKey]}
                        </button>
                      ))}
                    </div>
               </div>
             )}
          </div>

          {/* Presets Accordion */}
          <div className="flex-1 overflow-y-auto mb-3 border-t border-gray-700 pt-2">
             <button 
                onClick={() => setPresetsOpen(!presetsOpen)}
                className="flex items-center justify-between w-full text-left text-xs font-bold text-gray-300 hover:text-white mb-1"
             >
                <span>{t.presets}</span>
                <span className="text-[10px]">{presetsOpen ? '-' : '+'}</span>
             </button>
             
             {presetsOpen && (
               <div className="pl-1 mt-1 space-y-2">
                 <div className="mb-2">
                    <h4 className="text-[10px] text-brand-blue mb-1 font-semibold uppercase tracking-wider">{t.modern}</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {STYLE_PRESETS.map((p, i) => (
                        <button 
                          key={i}
                          onClick={() => applyPreset(p)}
                          className={`flex items-center gap-2 text-left text-[11px] p-2 rounded-md border transition-all shadow-sm ${
                            activePreset === p.label
                                ? 'bg-brand-blue text-white border-brand-blue' 
                                : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-brand-blue'
                          }`}
                          title={p.label}
                        >
                          <div className={`w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              activePreset === p.label ? 'border-white bg-white' : 'border-gray-500'
                          }`}>
                              {activePreset === p.label && <div className="w-1.5 h-1.5 rounded-full bg-brand-blue"></div>}
                          </div>
                          {p.label}
                        </button>
                      ))}
                    </div>
                 </div>
               </div>
             )}
          </div>

          {/* Generate Button */}
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-brand-blue text-white text-sm font-bold py-3 rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
               <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
               <>
                 <IconSparkles />
                 {t.generate}
               </>
            )}
          </button>

        </aside>

        {/* --- Main Display (Right) --- */}
        <main className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden">
           
           {/* Image Canvas */}
           <div className="relative w-full h-full flex items-center justify-center p-8 pb-24">
              {currentImage ? (
                 <img 
                    src={`data:${currentImage.mimeType};base64,${currentImage.data}`}
                    alt="Result"
                    className="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-300"
                    style={{
                      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`
                    }}
                 />
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-xl aspect-video border-4 border-dashed border-brand-blue/50 rounded-3xl bg-brand-blue/10 hover:bg-brand-blue/20 transition-all flex flex-col items-center justify-center cursor-pointer group"
                >
                   <div className="text-brand-blue mb-6 transform group-hover:scale-110 transition-transform duration-300">
                     <IconUploadLarge />
                   </div>
                   <h3 className="text-2xl font-bold text-brand-blue mb-2 shadow-black drop-shadow-lg">Upload Main Image</h3>
                   <p className="text-gray-400 text-sm">Click to browse</p>
                   
                   <input 
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleMainImageUpload}
                      className="hidden"
                   />
                </div>
              )}
           </div>

           {/* Bottom Toolbar */}
           {currentImage && (
             <div className="absolute bottom-6 bg-brand-panel border border-gray-700 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl z-20">
                {/* Undo */}
                <button 
                  onClick={handleUndo} 
                  disabled={historyIndex <= 0}
                  className="flex flex-col items-center text-gray-400 hover:text-white disabled:opacity-30 tooltip-wrap group"
                >
                  <IconUndo />
                  <span className="text-[10px] mt-1 group-hover:text-brand-blue">{t.undo} ({historyIndex})</span>
                </button>

                {/* Redo (Added) */}
                <button 
                  onClick={handleRedo} 
                  disabled={historyIndex >= history.length - 1}
                  className="flex flex-col items-center text-gray-400 hover:text-white disabled:opacity-30 tooltip-wrap group"
                >
                  <IconRedo />
                  <span className="text-[10px] mt-1 group-hover:text-brand-blue">{t.redo}</span>
                </button>

                <div className="w-px h-8 bg-gray-700"></div>

                {/* Flip */}
                <button onClick={() => setFlipH(!flipH)} className="flex flex-col items-center text-gray-400 hover:text-white group">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
                   <span className="text-[10px] mt-1 group-hover:text-brand-blue">Flip</span>
                </button>

                {/* Rotate */}
                <button onClick={() => setRotation(r => r - 90)} className="flex flex-col items-center text-gray-400 hover:text-white group">
                   <IconRotate />
                   <span className="text-[10px] mt-1 group-hover:text-brand-blue">Rotate L</span>
                </button>
                <button onClick={() => setRotation(r => r + 90)} className="flex flex-col items-center text-gray-400 hover:text-white group">
                   <div className="transform scale-x-[-1]"><IconRotate /></div>
                   <span className="text-[10px] mt-1 group-hover:text-brand-blue">Rotate R</span>
                </button>

                <div className="w-px h-8 bg-gray-700"></div>

                {/* 4K Upscale */}
                <button onClick={handleUpscale4K} className="flex flex-col items-center text-white hover:text-brand-blue group" title="Uses 3-Pro Model">
                   <span className="font-black text-lg leading-none">4K</span>
                   <span className="text-[10px] mt-1 group-hover:text-brand-blue">Upscale</span>
                </button>

                <div className="w-px h-8 bg-gray-700"></div>

                {/* Download (Far Right, Blue) */}
                <button onClick={downloadImage} className="flex flex-col items-center text-brand-blue hover:text-blue-400 group">
                   <IconDownload />
                   <span className="text-[10px] mt-1 font-bold">{t.download}</span>
                </button>
             </div>
           )}

        </main>
      </div>

      {/* Admin Modal */}
      {showAdmin && user.role === Role.ADMIN && (
        <AdminPanel user={user} lang={lang} onClose={() => setShowAdmin(false)} />
      )}

      {/* API Key Modal (Generic) */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-brand-panel w-full max-w-md rounded-xl p-6 shadow-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <IconKey /> Gemini API Key
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Please enter your Gemini API Key. This will be stored locally in your browser.
            </p>
            
            <input 
              type="text"
              placeholder="Enter API Key (AIza...)"
              defaultValue={localStorage.getItem('gemini_api_key') || ''}
              id="apiKeyInput"
              className="w-full bg-black/40 border border-gray-600 rounded p-3 text-white focus:border-brand-blue focus:outline-none mb-4"
            />
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                   const input = document.getElementById('apiKeyInput') as HTMLInputElement;
                   handleSaveApiKey(input.value);
                }}
                className="px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded font-bold text-sm"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
