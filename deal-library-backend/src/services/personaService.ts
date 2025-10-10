import { PersonaInsights } from '../types/deal';

export class PersonaService {
  private personaDatabase: Map<string, PersonaInsights> = new Map();

  constructor() {
    this.initializePersonaDatabase();
  }

  private initializePersonaDatabase(): void {
    // Food Storage Persona
    this.personaDatabase.set('food-storage', {
      segmentId: 'PIA_4515',
      personaName: 'The Efficient Family Prep Master',
      emoji: '🍽️',
      category: 'Home & Family',
      coreInsight: 'Time is the Luxury Commodity. The high overlap with Cookware & Bakeware (50.34%) and Toys/Baby Clothing (47.84% & 42.89%) confirms this is an extremely active Family Manager whose primary motivation is systemizing household logistics.',
      creativeHooks: [
        'Stop Cooking Every Night. Organize Your Kitchen Like a Command Center and Reclaim Your Weekends.',
        'The System That Saves You Hours Every Week',
        'From Chaos to Command Center in One Purchase'
      ],
      mediaTargeting: [
        'Target meal-prep blogs, organizing influencers (e.g., KonMari followers), and family-budget content',
        'Use placements on YouTube channels focusing on batch cooking or zero-waste lifestyle',
        'The purchase motivation is efficiency and savings'
      ],
      audienceMotivation: 'They are buying organization and time back, not just plastic or glass containers. They need solutions that are durable, non-toxic, and seamlessly stackable/transferable, enabling batch cooking and on-the-go fueling.',
      actionableStrategy: {
        creativeHook: 'Frame the product as a tool for time mastery. Focus on long-term sustainability and system benefits.',
        mediaTargeting: 'Target meal-prep blogs, organizing influencers (e.g., KonMari followers), and family-budget content. Use placements on YouTube channels focusing on batch cooking or zero-waste lifestyle.'
      }
    });

    // Golf Persona
    this.personaDatabase.set('golf', {
      segmentId: 'PIA_5479',
      personaName: 'The Status-Driven Performance Analyst',
      emoji: '⛳',
      category: 'Fitness & Sports',
      coreInsight: 'Equipment is the Extension of Professional Status. The overlap with Electronics (22.59%), DVDs & Videos (25.89%), and Vehicles & Parts (20.21%) reveals a buyer who views golf as a technical, high-status pursuit integrated into their professional/leisure life.',
      creativeHooks: [
        'The Only Investment That Improves Your Scorecard and Your Network. Precision Engineered for Excellence.',
        'Where Performance Meets Prestige',
        'The Data-Driven Golfer\'s Edge'
      ],
      mediaTargeting: [
        'Target affluent financial news platforms, high-end automotive review sites, and technical sports analysis podcasts',
        'Placement should be contextual, focusing on content that discusses high-performance systems (whether finance, tech, or automotive)',
        'Focus on precision engineering and measurable improvement'
      ],
      audienceMotivation: 'This individual approaches the game with an analytical, data-driven mindset. They are not satisfied with "good enough"; they demand precision, metrics, and the competitive edge that top-tier, technologically advanced gear provides.',
      actionableStrategy: {
        creativeHook: 'Speak to precision engineering and measurable improvement. Highlight the product\'s role in the data and experience of the game.',
        mediaTargeting: 'Target affluent financial news platforms, high-end automotive review sites, and technical sports analysis podcasts. Placement should be contextual, focusing on content that discusses high-performance systems.'
      }
    });

    // Home and Garden Persona
    this.personaDatabase.set('home-garden', {
      segmentId: 'PIA_4697',
      personaName: 'The Functional, Social Home Maintainer',
      emoji: '🏡',
      category: 'Home & Family',
      coreInsight: 'The Yard is a Social Asset, Not Just a Chore. The strong overlaps with Household Supplies (49.50%) and Leisure/Social goods like Alcoholic Beverages (46.05%) and Outdoor Recreation (43.76%) define a buyer who balances functional maintenance with social utility.',
      creativeHooks: [
        'Stop Maintaining Your Yard. Start Cultivating Your Social Space.',
        'Where Function Meets Fun',
        'The Backyard That Brings People Together'
      ],
      mediaTargeting: [
        'Target outdoor living/BBQ content, cocktail/craft brewing social channels, and seasonal home improvement guides',
        'Use hyper-local, weather-triggered campaigns (e.g., promote fertilizers after the first spring rain, or lighting before summer holidays)',
        'Focus on social utility and entertainment value'
      ],
      audienceMotivation: 'They invest in the lawn and garden not only for curb appeal and property value but to create a high-quality, comfortable outdoor destination for entertaining and personal enjoyment.',
      actionableStrategy: {
        creativeHook: 'Frame the product as the facilitator of social events and personal relaxation. Focus on the transformation from work to reward.',
        mediaTargeting: 'Target outdoor living/BBQ content, cocktail/craft brewing social channels, and seasonal home improvement guides. Use hyper-local, weather-triggered campaigns.'
      }
    });

    // Condiments and Sauces Persona
    this.personaDatabase.set('condiments-sauces', {
      segmentId: 'PIA_3160',
      personaName: 'The Experiential, Family-Oriented Flavor Creator',
      emoji: '🌶️',
      category: 'Home & Family',
      coreInsight: 'Flavor is the Easiest Form of Home Entertainment. The overwhelming overlap with Arts & Entertainment (44.35%) and high cross-shopping with Baby & Toddler (35.93%) signals a buyer who views food, particularly flavor enhancers, as a central pillar of accessible domestic experience and family enjoyment.',
      creativeHooks: [
        'Break the Boring Meal Loop. Unlock 5-Star Flavor With a Single Spoon.',
        'Where Every Meal Becomes a Memory',
        'The Secret Ingredient to Family Fun'
      ],
      mediaTargeting: [
        'Target cooking show viewing moments (contextual TV/streaming ads), family recipe blogs, and social content featuring DIY flavor creation and food challenges',
        'Focus on evening and weekend placements when meal prep shifts from necessity to leisure',
        'Emphasize creativity and family bonding'
      ],
      audienceMotivation: 'They are motivated by novelty, quality, and the ability to easily customize meals for various family palates. These condiments are not background ingredients; they are the "star power" that turns a simple meal into an engaging, memorable event.',
      actionableStrategy: {
        creativeHook: 'Position the product as the catalyst for creativity and family bonding. Focus on the story and experience of the food.',
        mediaTargeting: 'Target cooking show viewing moments (contextual TV/streaming ads), family recipe blogs, and social content featuring DIY flavor creation and food challenges.'
      }
    });

    // Baby Health Persona
    this.personaDatabase.set('baby-health', {
      segmentId: 'PIA_2449',
      personaName: 'The Wellness-Obsessed New Parent',
      emoji: '💊',
      category: 'Home & Family',
      coreInsight: 'Zero Tolerance for Risk; Seeking Authoritative Validation. The primary overlaps with Baby & Toddler (47.39%), Food Items (34.01%), and Nursing & Feeding (32.98%) illustrate a buyer who is hyper-focused on the integrated safety and nutritional health of their child.',
      creativeHooks: [
        'The Non-Negotiable Standard. Confidence in Care, Backed by Science, Trusted by Experts.',
        'When Your Child\'s Health is Non-Negotiable',
        'The Science of Safe Parenting'
      ],
      mediaTargeting: [
        'Target pediatric health authority websites, medical institution content, and closed parenting forums focused on wellness and nutrition',
        'Use high-frequency messaging around purity claims (non-toxic, organic) and expert endorsement',
        'Focus on scientific validation and safety credentials'
      ],
      audienceMotivation: 'This is a methodical, research-intensive buyer. The purchase of Baby Health products is non-negotiable and driven by the need for authoritative, pediatrician-backed evidence. They seek efficacy, purity, and proven safety records.',
      actionableStrategy: {
        creativeHook: 'Lead with scientific substantiation and safety credentials. The creative must eliminate doubt.',
        mediaTargeting: 'Target pediatric health authority websites, medical institution content, and closed parenting forums focused on wellness and nutrition. Use high-frequency messaging around purity claims and expert endorsement.'
      }
    });

    // Personal Care Persona
    this.personaDatabase.set('personal-care', {
      segmentId: 'PIA_4000',
      personaName: 'The Proactive Self-Optimizing Professional',
      emoji: '✨',
      category: 'Beauty & Wellness',
      coreInsight: 'The Optimized Self. This buyer is making intentional purchases in the Personal Care category, indicating a focus on self-improvement. The extreme overlap with related segments like Cosmetics and Health & Beauty confirms a singular focus on holistic self-management and external presentation as a form of professional and social status.',
      creativeHooks: [
        'The Optimized Self. Elevate Your Daily Routine, Elevate Your Life.',
        'Small Choices, Big Impact on Your Professional Presence',
        'The Daily Investment That Pays Dividends'
      ],
      mediaTargeting: [
        'Target users on business news platforms, executive lifestyle content, and podcasts focused on productivity and personal development',
        'Use contextual targeting on platforms that combine fitness or beauty content with organizational or productivity tips',
        'Focus on the cumulative impact of small, high-quality choices on long-term well-being and appearance'
      ],
      audienceMotivation: 'They view their personal care routine as an essential daily investment that directly impacts their confidence and efficacy. This buyer is making intentional purchases focused on self-improvement and professional presentation.',
      actionableStrategy: {
        creativeHook: 'The Optimized Self. Elevate Your Daily Routine, Elevate Your Life. Focus messaging on the cumulative impact of small, high-quality choices on long-term well-being and appearance.',
        mediaTargeting: 'Target users on business news platforms, executive lifestyle content, and podcasts focused on productivity and personal development. Use contextual targeting on platforms that combine fitness or beauty content with organizational or productivity tips.'
      }
    });

    // Cosmetics Persona
    this.personaDatabase.set('cosmetics', {
      segmentId: 'PIA_4003',
      personaName: 'The Aspirational Presentation Investor',
      emoji: '💄',
      category: 'Beauty & Wellness',
      coreInsight: 'The Optimized Self. This buyer is making intentional purchases in the Cosmetics category, indicating a focus on self-improvement. Just like the other beauty categories, this buyer is motivated by achieving a superior, visible result that reflects their commitment to wellness and self-care.',
      creativeHooks: [
        'The Optimized Self. Elevate Your Daily Routine, Elevate Your Life.',
        'Visible Results, Invisible Effort',
        'The Premium Investment in Your Professional Image'
      ],
      mediaTargeting: [
        'Target luxury e-commerce spaces, fashion and beauty editorial content, and high-end wellness apps',
        'Use creative that showcases transformation and the fusion of internal health and external confidence',
        'Focus on efficacy, premium ingredients, and the instant, visible return on investment in their presentation and status'
      ],
      audienceMotivation: 'The purchase is seen as a high-value tool for enhancing their professional and social confidence. They are motivated by achieving a superior, visible result that reflects their commitment to wellness and self-care.',
      actionableStrategy: {
        creativeHook: 'The Optimized Self. Elevate Your Daily Routine, Elevate Your Life. Focus on efficacy, premium ingredients, and the instant, visible return on investment in their presentation and status.',
        mediaTargeting: 'Target luxury e-commerce spaces, fashion and beauty editorial content, and high-end wellness apps. Use creative that showcases transformation and the fusion of internal health and external confidence.'
      }
    });

    // Health & Beauty Persona
    this.personaDatabase.set('health-beauty', {
      category: 'Beauty & Wellness',
      segmentId: 'PIA_2011',
      personaName: 'The Holistic Wellness Integrator',
      emoji: '🌿',
      coreInsight: 'The Optimized Self. This buyer is making intentional purchases in the Health & Beauty category, indicating a focus on self-improvement. This segment acts as the central hub of the "Optimized Self" persona, showing simultaneous high-intent purchasing in both internal health (Health) and external presentation (Beauty).',
      creativeHooks: [
        'The Optimized Self. Elevate Your Daily Routine, Elevate Your Life.',
        'Where Inner Health Meets Outer Confidence',
        'The Synergy of Self-Care That Compounds'
      ],
      mediaTargeting: [
        'Target functional medicine and preventative health content, high-end yoga and meditation apps, and content discussing ingredient sourcing and clean label claims',
        'Use messaging that validates their proactive lifestyle',
        'Speak to the synergy of products—how one item supports the other—and emphasize long-term, compounding health benefits'
      ],
      audienceMotivation: 'Their purchasing is a reflection of a holistic, preventative philosophy where well-being is viewed as a full system that must be proactively managed. They view their personal care routine as an essential daily investment.',
      actionableStrategy: {
        creativeHook: 'The Optimized Self. Elevate Your Daily Routine, Elevate Your Life. Speak to the synergy of products—how one item supports the other—and emphasize long-term, compounding health benefits.',
        mediaTargeting: 'Target functional medicine and preventative health content, high-end yoga and meditation apps, and content discussing ingredient sourcing and clean label claims. Use messaging that validates their proactive lifestyle.'
      }
    });

    // Fitness & Nutrition Persona (Nuts & Seeds proxy)
    this.personaDatabase.set('fitness-nutrition', {
      category: 'Fitness & Sports',
      segmentId: 'PIA_3275',
      personaName: 'The Sustained Energy System Builder',
      emoji: '🥜',
      coreInsight: 'The Proactive Generalist. This buyer is making intentional purchases in the Nuts & Seeds category (a high-intent proxy for nutrition), indicating a focus on self-improvement. The strong cross-shopping with Household Supplies and Outdoor Recreation suggests a buyer focused on functional, disciplined energy management.',
      creativeHooks: [
        'Fuel Your Endurance, Power Your Day. Clean Energy for a High-Output Life.',
        'The Non-Perishable Power Source for Your Active Life',
        'Sustained Energy That Never Lets You Down'
      ],
      mediaTargeting: [
        'Target hiking, camping, and endurance sport communities',
        'Use contextual targeting on platforms that combine fitness or beauty content with logistical and organizational tips for travel or daily schedules',
        'Focus on the product\'s role as a non-perishable, convenient source of sustained power for the "long haul"'
      ],
      audienceMotivation: 'Their nutrition purchases are designed to sustain activity, not just recover, prioritizing durability, convenience, and clean energy sources. They are focused on functional, disciplined energy management for both their demanding physical activities and domestic responsibilities.',
      actionableStrategy: {
        creativeHook: 'Fuel Your Endurance, Power Your Day. Clean Energy for a High-Output Life. Focus on the product\'s role as a non-perishable, convenient source of sustained power for the "long haul."',
        mediaTargeting: 'Target hiking, camping, and endurance sport communities. Use contextual targeting on platforms that combine fitness or beauty content with logistical and organizational tips for travel or daily schedules.'
      }
    });

    // Fitness Persona
    this.personaDatabase.set('fitness', {
      category: 'Fitness & Sports',
      segmentId: 'PIA_5317',
      personaName: 'The Gear-Driven Lifestyle Achiever',
      emoji: '👟',
      coreInsight: 'The Proactive Generalist. This buyer is making intentional purchases in the Exercise & Fitness category, indicating a focus on self-improvement. The top overlaps with Laptops and Shoes indicate this buyer is highly tech-integrated and gear-focused.',
      creativeHooks: [
        'Performance Does Not Compromise. Demand the Same Excellence in Your Workout as You Do in Your Work.',
        'Where Technology Meets Physical Performance',
        'The Data-Driven Athlete\'s Advantage'
      ],
      mediaTargeting: [
        'Target high-end consumer electronics review sites (especially wearables/smart home tech), business productivity content, and forums dedicated to high-performance footwear and apparel',
        'Link physical performance directly to professional success',
        'Focus on the technical superiority and data-driven results of the equipment'
      ],
      audienceMotivation: 'They view their fitness equipment and apparel as performance-critical tools required for success in all domains—the latest tech enables their professional life, and the best gear enables their physical performance.',
      actionableStrategy: {
        creativeHook: 'Performance Does Not Compromise. Demand the Same Excellence in Your Workout as You Do in Your Work. Focus on the technical superiority and data-driven results of the equipment.',
        mediaTargeting: 'Target high-end consumer electronics review sites (especially wearables/smart home tech), business productivity content, and forums dedicated to high-performance footwear and apparel. Link physical performance directly to professional success.'
      }
    });

    // Pet Supplies Persona
    this.personaDatabase.set('pet-supplies', {
      category: 'Pet Care',
      segmentId: 'PIA_2024',
      personaName: 'The Pet Health & Wellness Advocate',
      emoji: '🐾',
      coreInsight: 'The Pet is a Full Family Member; Care is Holistic. This buyer is highly engaged, seeing their pet as a full member of the family. The cross-shopping with Outerwear and Home & Garden indicates a holistic approach where the pet is actively involved in the family\'s outdoor lifestyle and the owner maintains a high-quality, controlled home environment for their companion.',
      creativeHooks: [
        'Family Doesn\'t End at the Door. Invest in Their Health, Invest in Your Bond.',
        'Premium Preventative Medicine for Your Companion',
        'Self-Care for Your Best Friend'
      ],
      mediaTargeting: [
        'Target veterinary health blogs, human wellness apps (yoga/meditation), and specialty pet-diet communities (e.g., raw food, allergy)',
        'Use creative that positions the product as "premium preventative medicine" or "self-care for your companion"',
        'Focus on ingredient quality, measurable health outcomes, and the emotional connection forged through shared outdoor time'
      ],
      audienceMotivation: 'Their primary motivation is preventative care and long-term vitality, investing in the best for nutrition, grooming, and shared activities. They seek products that enhance the pet\'s quality of life and strengthen the human-animal bond.',
      actionableStrategy: {
        creativeHook: 'Family Doesn\'t End at the Door. Invest in Their Health, Invest in Your Bond. Focus on ingredient quality, measurable health outcomes, and the emotional connection forged through shared outdoor time.',
        mediaTargeting: 'Target veterinary health blogs, human wellness apps (yoga/meditation), and specialty pet-diet communities (e.g., raw food, allergy). Use creative that positions the product as "premium preventative medicine" or "self-care for your companion."'
      }
    });

    // Animals & Pet Supplies Persona (Integrated Pet Home Manager)
    this.personaDatabase.set('animals-pet-supplies', {
      category: 'Pet Care',
      segmentId: 'PIA_2024',
      personaName: 'The Integrated Pet Home Manager',
      emoji: '🏡',
      coreInsight: 'The Pet is a Full Family Member; Care is Holistic. This buyer is highly engaged, seeing their pet as a full member of the family. The cross-shopping with Outerwear and Home & Garden suggests a buyer focused on efficient logistics, managing pet-related messes, and ensuring the pet\'s environment is seamlessly integrated with the family\'s living space.',
      creativeHooks: [
        'Systematize Your Love. Effortless Care for a Spotless Home and a Happy Companion.',
        'Where Pet Care Meets Home Management',
        'Seamless Integration for the Modern Pet Family'
      ],
      mediaTargeting: [
        'Target home organization content, smart home maintenance products, and lifestyle blogs focused on pet-friendly interior design',
        'Use solution-oriented creative that highlights mess reduction and a clean, stress-free home',
        'Focus on ease of maintenance, odor control, and shared comfort without sacrificing home cleanliness'
      ],
      audienceMotivation: 'They seek products that make the management of their beloved companion efficient and stress-free. They want solutions that maintain a clean, organized home while providing the best care for their pet.',
      actionableStrategy: {
        creativeHook: 'Systematize Your Love. Effortless Care for a Spotless Home and a Happy Companion. Focus on ease of maintenance, odor control, and shared comfort without sacrificing home cleanliness.',
        mediaTargeting: 'Target home organization content, smart home maintenance products, and lifestyle blogs focused on pet-friendly interior design. Use solution-oriented creative that highlights mess reduction and a clean, stress-free home.'
      }
    });

    // Cat Supplies Persona
    this.personaDatabase.set('cat-supplies', {
      category: 'Pet Care',
      segmentId: 'PIA_2033',
      personaName: 'The Integrated Cat Environment Designer',
      emoji: '🐈',
      coreInsight: 'The Cat is the Home\'s Sophisticated Co-Resident. This buyer is highly engaged, seeing their cat as a full member of the family. The cross-shopping with Food Service and Foot Care shows a dedication to core wellness. This buyer invests in a high quality of life for their pet, prioritizing cleanliness, comfort, and an enriched, non-disruptive environment.',
      creativeHooks: [
        'The Sanctuary, Perfected. Supplies Designed for Their Comfort, Integrated for Your Style.',
        'Sophisticated Design Meets Feline Needs',
        'Where Aesthetics Meet Function for Your Cat'
      ],
      mediaTargeting: [
        'Target interior design blogs, home organization magazines, and streaming/media review content',
        'Creative should emphasize sophisticated design, space-saving, and furniture protection from a cat\'s perspective',
        'Focus on sophisticated design, low-maintenance routines, and premium materials that cater to the cat\'s intrinsic needs'
      ],
      audienceMotivation: 'They seek supplies that are discreet, aesthetically pleasing, and meet the high standards of a discerning owner who manages food delivery and personal comfort with care. They want products that enhance their home\'s design while providing optimal comfort for their cat.',
      actionableStrategy: {
        creativeHook: 'The Sanctuary, Perfected. Supplies Designed for Their Comfort, Integrated for Your Style. Focus on sophisticated design, low-maintenance routines, and premium materials that cater to the cat\'s intrinsic needs.',
        mediaTargeting: 'Target interior design blogs, home organization magazines, and streaming/media review content. Creative should emphasize sophisticated design, space-saving, and furniture protection from a cat\'s perspective.'
      }
    });

    // Dog Supplies Persona
    this.personaDatabase.set('dog-supplies', {
      category: 'Pet Care',
      segmentId: 'PIA_2045',
      personaName: 'The Tech-Driven Adventure Partner',
      emoji: '🐕',
      coreInsight: 'Performance, Safety, and Shared Activity. This buyer is highly engaged, seeing their pet as a full member of the family. The cross-shopping with Entertainment Centers & TV Stands and Vehicles & Parts suggests a buyer who values high-end mobility, safety, and integration.',
      creativeHooks: [
        'The Best Partner for the Adventure Ahead. Gear Up for Life On the Road and Off the Leash.',
        'Performance Gear for Your Adventure Companion',
        'Safety Meets Adventure for Your Best Friend'
      ],
      mediaTargeting: [
        'Target automotive review sites (especially SUVs/trucks/utility vehicles), adventure travel blogs, and tech review sites (for smart pet devices and trackers)',
        'Feature durability and performance ratings in all placements',
        'Focus on durability, vehicle safety ratings, and performance gear that supports active outdoor lifestyles'
      ],
      audienceMotivation: 'They invest in equipment (kennels, travel seats, GPS trackers) that allows the dog to travel safely and comfortably, extending the family unit into vehicles and outdoor spaces. They are looking for products that facilitate a safe, active, and mobile lifestyle with their dog.',
      actionableStrategy: {
        creativeHook: 'The Best Partner for the Adventure Ahead. Gear Up for Life On the Road and Off the Leash. Focus on durability, vehicle safety ratings, and performance gear that supports active outdoor lifestyles.',
        mediaTargeting: 'Target automotive review sites (especially SUVs/trucks/utility vehicles), adventure travel blogs, and tech review sites (for smart pet devices and trackers). Feature durability and performance ratings in all placements.'
      }
    });

    // Pet Owners Persona (High-Value Companion Nurturer)
    this.personaDatabase.set('pet-owners', {
      category: 'Pet Care',
      segmentId: 'PIA_2024',
      personaName: 'The High-Value Companion Nurturer',
      emoji: '💖',
      coreInsight: 'The Pet is a Full Family Member; Care is Holistic. This buyer is highly engaged, seeing their pet as a full member of the family. The cross-shopping with Outerwear and Home & Garden confirms a desire for shared comfort and quality time.',
      creativeHooks: [
        'Family Doesn\'t End at the Door. Invest in Their Health, Invest in Your Bond.',
        'Where Love Meets Quality Care',
        'Premium Care for Your Family Member'
      ],
      mediaTargeting: [
        'Target content related to pet health trends, lifestyle integration (e.g., traveling with pets), and premium/specialty product reviews',
        'Use emotional creative focused on the human-animal bond',
        'Focus on emotional, visually rich creative that showcases the pet and owner engaged in loving, comfortable, and active moments together'
      ],
      audienceMotivation: 'The purchasing decisions are centered on the emotional bond, prioritizing products that enhance comfort, facilitate shared activity, and ensure the pet\'s presence elevates the quality of life for the entire family.',
      actionableStrategy: {
        creativeHook: 'Family Doesn\'t End at the Door. Invest in Their Health, Invest in Your Bond. Use emotional, visually rich creative that showcases the pet and owner engaged in loving, comfortable, and active moments together.',
        mediaTargeting: 'Target content related to pet health trends, lifestyle integration (e.g., traveling with pets), and premium/specialty product reviews. Use emotional creative focused on the human-animal bond.'
      }
    });

    // Activewear Persona
    this.personaDatabase.set('activewear', {
      category: 'Fitness & Sports',
      segmentId: 'PIA_2143',
      personaName: 'The Performance Gear Builder',
      emoji: '💪',
      coreInsight: 'Fitness is an Integrated System, Not Just an Activity. The extreme cross-shopping with Outerwear and 3D Printers signals a buyer focused on building functional, multi-environment systems. They are not casual gym-goers; they are DIY integrators who demand performance gear that functions across extreme conditions.',
      creativeHooks: [
        'Beyond the Gym: Engineer Your Performance. Gear Built for the Systems You Create.',
        'Technical Excellence Meets Athletic Performance',
        'The DIY Athlete\'s Precision Tool'
      ],
      mediaTargeting: [
        'Target DIY/maker forums, home automation content, and adventure sports blogs',
        'Use placement on platforms that connect technical hobbies with athletic pursuits',
        'Focus on material science, technical features, and resilience in outdoor or complex scenarios'
      ],
      audienceMotivation: 'They are highly technical/hands-on individuals who view activewear as a functional component of their holistic, high-performance life system. They demand gear that performs across extreme conditions and integrates with their technical lifestyle.',
      actionableStrategy: {
        creativeHook: 'Beyond the Gym: Engineer Your Performance. Gear Built for the Systems You Create. Focus on material science, technical features, and resilience in outdoor or complex scenarios.',
        mediaTargeting: 'Target DIY/maker forums, home automation content, and adventure sports blogs. Use placement on platforms that connect technical hobbies with athletic pursuits.'
      }
    });

    // Dresses Persona
    this.personaDatabase.set('dresses', {
      category: 'Fashion & Style',
      segmentId: 'PIA_2164',
      personaName: 'The Family Entertainment Curator',
      emoji: '👗',
      coreInsight: 'Presentation is Tied to Shared Experience and Domestic Comfort. The massive overlap with Toys and Media shows a buyer whose apparel choices are heavily influenced by the social and entertainment calendar of the family.',
      creativeHooks: [
        'Dress for the Moment, Cherish the Memories. The Perfect Look for Every Milestone.',
        'Where Style Meets Family Moments',
        'The Social Calendar\'s Essential Wardrobe'
      ],
      mediaTargeting: [
        'Target parenting lifestyle blogs, family travel guides, and streaming content recommendation platforms',
        'Run campaigns during holiday/seasonal social planning periods',
        'Focus on emotional utility, versatility between social events and family gatherings, and shareable experiences'
      ],
      audienceMotivation: 'Dresses are purchased for occasions and celebrations (social moments), while the high consumption of media and toys reflects a deep commitment to high-quality, comfortable domestic downtime. Their clothing supports both their public and private roles as a family leader.',
      actionableStrategy: {
        creativeHook: 'Dress for the Moment, Cherish the Memories. The Perfect Look for Every Milestone. Focus on emotional utility, versatility between social events and family gatherings, and shareable experiences.',
        mediaTargeting: 'Target parenting lifestyle blogs, family travel guides, and streaming content recommendation platforms. Run campaigns during holiday/seasonal social planning periods.'
      }
    });

    // Shirts & Tops Persona
    this.personaDatabase.set('shirts-tops', {
      category: 'Fashion & Style',
      segmentId: 'PIA_2178',
      personaName: 'The Routine-Driven Practicalist',
      emoji: '👔',
      coreInsight: 'Efficiency and Discipline Define Personal and Domestic Life. High overlap with Shaving & Grooming and Household Supplies identifies a highly routine-focused individual. Shirts and tops are viewed as essential, high-utility tools for daily presentation.',
      creativeHooks: [
        'The Non-Negotiable Standard. Effortless Presentation, Engineered for Your Daily Grind.',
        'Efficiency Meets Style in Every Thread',
        'The Disciplined Professional\'s Essential'
      ],
      mediaTargeting: [
        'Target productivity apps, minimalist fashion/lifestyle content, and domestic organization blogs',
        'Use contextual placement near "best laundry products" or "five-minute grooming routine" content',
        'Focus on wash-and-wear durability, wrinkle-resistance, and time-saving features'
      ],
      audienceMotivation: 'This buyer applies the same level of disciplined efficiency to their personal appearance as they do to domestic maintenance. They require minimal fuss and maximum durability in their clothing choices.',
      actionableStrategy: {
        creativeHook: 'The Non-Negotiable Standard. Effortless Presentation, Engineered for Your Daily Grind. Focus on wash-and-wear durability, wrinkle-resistance, and time-saving features.',
        mediaTargeting: 'Target productivity apps, minimalist fashion/lifestyle content, and domestic organization blogs. Use contextual placement near "best laundry products" or "five-minute grooming routine" content.'
      }
    });

    // Clothing Accessories Persona
    this.personaDatabase.set('clothing-accessories', {
      category: 'Fashion & Style',
      segmentId: 'PIA_2231',
      personaName: 'The Integrated Wellness Enthusiast',
      emoji: '🎯',
      coreInsight: 'Accessories are Functional Tools for Holistic Optimization. The extreme, repeated overlap with Fitness & Nutrition shows that accessories are not decorative—they are functional gear supporting a deeply integrated health and optimization regimen.',
      creativeHooks: [
        'The Final Component. Precision Gear for Your Integrated Health System.',
        'Where Accessories Meet Performance Goals',
        'The Holistic Optimizer\'s Essential Tools'
      ],
      mediaTargeting: [
        'Target specialty health food retailers, fitness data tracking apps, and content on holistic health and performance maximization',
        'Focus on niche blogs discussing specific gear for specific activities',
        'Focus on how the accessory closes the performance gap or supports a specific diet/fitness methodology'
      ],
      audienceMotivation: 'This buyer sees an accessory (e.g., belt, compression sock, specialty bag) as an indispensable tool for achieving a dietary, physical, or performance goal. They view accessories as functional components of their health system.',
      actionableStrategy: {
        creativeHook: 'The Final Component. Precision Gear for Your Integrated Health System. Focus on how the accessory closes the performance gap or supports a specific diet/fitness methodology.',
        mediaTargeting: 'Target specialty health food retailers, fitness data tracking apps, and content on holistic health and performance maximization. Focus on niche blogs discussing specific gear for specific activities.'
      }
    });

    // Sunglasses Persona
    this.personaDatabase.set('sunglasses', {
      category: 'Fashion & Style',
      segmentId: 'PIA_2282',
      personaName: 'The Professional Performance Traveler',
      emoji: '🕶️',
      coreInsight: 'Essential Gear for Active, High-Tech Mobility. High cross-shopping with Laptops, Shoes, and Outdoor Recreation indicates this is a professional who is always in motion. Sunglasses are essential, high-utility gear for an active life that blends high-stakes work with physical activity.',
      creativeHooks: [
        'Clarity in Motion. The Essential Tool for Life at Full Speed.',
        'Professional Performance Meets Active Lifestyle',
        'The Mobile Professional\'s Visual Edge'
      ],
      mediaTargeting: [
        'Target business travel guides, high-tech gadget reviewers, and outdoor/running apps with GPS integration',
        'Place ads contextually near content discussing \'essential packing lists\' or \'best tech for travel\'',
        'Focus on lens technology, polarization, and ruggedness as tools for visual performance and productivity'
      ],
      audienceMotivation: 'They demand durability, lens technology, and style that performs in any environment—from the commute to the trail. Sunglasses are essential gear for their active, high-tech mobility lifestyle.',
      actionableStrategy: {
        creativeHook: 'Clarity in Motion. The Essential Tool for Life at Full Speed. Focus on lens technology, polarization, and ruggedness as tools for visual performance and productivity.',
        mediaTargeting: 'Target business travel guides, high-tech gadget reviewers, and outdoor/running apps with GPS integration. Place ads contextually near content discussing \'essential packing lists\' or \'best tech for travel\'.'
      }
    });

    // Shoes Persona
    this.personaDatabase.set('shoes', {
      category: 'Fashion & Style',
      segmentId: 'PIA_2335',
      personaName: 'The Dual-Domain Achiever',
      emoji: '👟',
      coreInsight: 'Utility and Performance Across Domestic and Professional Life. High overlap with Household Supplies and Laptops shows a buyer committed to maximizing performance and efficiency across all domains. Shoes are purchased for specific utility.',
      creativeHooks: [
        'The Right Foundation for Every Task. Engineered Comfort, Optimized for Your Entire Day.',
        'Performance Footwear for the Multi-Domain Professional',
        'Where Comfort Meets Productivity'
      ],
      mediaTargeting: [
        'Target home organization and productivity content, tech review sites, and online learning/professional development platforms',
        'Use creative that links comfort and support directly to better focus and output',
        'Focus on the technical function of the shoe for specific tasks (performance, comfort, durability)'
      ],
      audienceMotivation: 'This segment views all purchases through a lens of high utility and specific function. Whether that\'s comfort for managing home logistics or support for their active, tech-integrated professional life.',
      actionableStrategy: {
        creativeHook: 'The Right Foundation for Every Task. Engineered Comfort, Optimized for Your Entire Day. Focus on the technical function of the shoe for specific tasks (performance, comfort, durability).',
        mediaTargeting: 'Target home organization and productivity content, tech review sites, and online learning/professional development platforms. Use creative that links comfort and support directly to better focus and output.'
      }
    });

    // Luggage & Bags Persona
    this.personaDatabase.set('luggage-bags', {
      category: 'Travel & Lifestyle',
      segmentId: 'PIA_2013',
      personaName: 'The Efficient Travel Logisticians',
      emoji: '🎒',
      coreInsight: 'Mobility is a System; Efficiency is the Priority. Cross-shopping with Household Supplies, Components, and Laptops defines a buyer focused on organized, modular, and durable mobility systems. Luggage is an extension of their home organization efforts.',
      creativeHooks: [
        'Engineered for Efficiency. Protect Your Assets, Simplify Your Journey.',
        'The Organized Traveler\'s Precision System',
        'Where Logistics Meet Mobility'
      ],
      mediaTargeting: [
        'Target business travel media, organizational systems content (e.g., modular living), and long-term tech accessory reviews',
        'Run campaigns focusing on \'asset protection\' and \'carry-on optimization\'',
        'Focus on durability, weight-to-capacity ratios, and smart organizational features (pockets, tech charging ports)'
      ],
      audienceMotivation: 'They prioritize features like weight, durability, and tech integration (Component/Laptop storage). This is a planned purchase centered on logistics and asset protection for their mobile lifestyle.',
      actionableStrategy: {
        creativeHook: 'Engineered for Efficiency. Protect Your Assets, Simplify Your Journey. Focus on durability, weight-to-capacity ratios, and smart organizational features (pockets, tech charging ports).',
        mediaTargeting: 'Target business travel media, organizational systems content (e.g., modular living), and long-term tech accessory reviews. Run campaigns focusing on \'asset protection\' and \'carry-on optimization\'.'
      }
    });

    // Event Tickets Persona
    this.personaDatabase.set('event-tickets', {
      category: 'Entertainment',
      segmentId: 'PIA_2337',
      personaName: 'The High-Value Experience Seeker',
      emoji: '🎟️',
      coreInsight: 'Curating Memorable Social and Sensory Experiences. The top overlap with Arts & Entertainment and Food Items confirms a focus on curated, high-quality, and highly social leisure. This buyer is investing in memorable experiences anchored by social connection.',
      creativeHooks: [
        'Invest in the Unforgettable. The Moments That Matter Are Planned Here.',
        'Where Social Connection Meets Premium Experience',
        'The Curated Experience Collector'
      ],
      mediaTargeting: [
        'Target local restaurant/bar review sites, high-end cultural content, and social media groups focused on local events and culinary experiences',
        'Use geo-targeting around venues and run campaigns during post-work hours',
        'Focus on the scarcity of the experience, the high-quality atmosphere, and the social bonding opportunity'
      ],
      audienceMotivation: 'Event Tickets are the ultimate planned purchase for high-value leisure time. They seek high-quality sensory input and consumption experiences that create memorable social connections.',
      actionableStrategy: {
        creativeHook: 'Invest in the Unforgettable. The Moments That Matter Are Planned Here. Focus on the scarcity of the experience, the high-quality atmosphere, and the social bonding opportunity.',
        mediaTargeting: 'Target local restaurant/bar review sites, high-end cultural content, and social media groups focused on local events and culinary experiences. Use geo-targeting around venues and run campaigns during post-work hours.'
      }
    });

    // Media Persona
    this.personaDatabase.set('media', {
      category: 'Entertainment',
      segmentId: 'PIA_2015',
      personaName: 'The Domestic Comfort Seeker',
      emoji: '📺',
      coreInsight: 'Media is the Anchor for Quality, Comfortable Domestic Downtime. High overlap with Toys and Home & Garden shows that media consumption is fundamentally tied to comfortable, high-quality domestic and family life.',
      creativeHooks: [
        'The Ultimate Sanctuary. Find Your Next Obsession from the Comfort of Your Own Space.',
        'Where Comfort Meets Entertainment',
        'The Home Sanctuary\'s Entertainment Hub'
      ],
      mediaTargeting: [
        'Target home décor blogs, streaming device review sites, and family activity planners',
        'Contextual placement near content focused on "creating a perfect movie night" or "weekend home projects"',
        'Focus on ease of access, variety, and the ability to enhance a cozy, high-quality home environment'
      ],
      audienceMotivation: 'Media serves as the anchor for family downtime and in-home entertainment, complementing a well-maintained, sanctuary-like home environment. Their purchase motivation is for ease, relaxation, and shared experience.',
      actionableStrategy: {
        creativeHook: 'The Ultimate Sanctuary. Find Your Next Obsession from the Comfort of Your Own Space. Focus on ease of access, variety, and the ability to enhance a cozy, high-quality home environment.',
        mediaTargeting: 'Target home décor blogs, streaming device review sites, and family activity planners. Contextual placement near content focused on "creating a perfect movie night" or "weekend home projects".'
      }
    });

    // Arts & Entertainment Persona
    this.personaDatabase.set('arts-entertainment', {
      category: 'Entertainment',
      segmentId: 'PIA_2003',
      personaName: 'The Family Experience Curator',
      emoji: '🎨',
      coreInsight: 'Leisure Time is an Investment in Shared Family Culture. High cross-shopping with Event Tickets and Baby & Toddler confirms that this buyer prioritizes both high-value, curated leisure experiences and domestic, shared moments of enrichment.',
      creativeHooks: [
        'The Moments That Shape Them. Curate a Life Rich in Experience, Starting Today.',
        'Where Culture Meets Family Bonding',
        'The Educational Entertainment Experience'
      ],
      mediaTargeting: [
        'Target high-end parenting/developmental blogs, local event listings, and educational content hubs',
        'Use placement near content discussing "sensory play" or "cultural outings with kids"',
        'Focus on the long-term emotional and educational value of shared media and activities'
      ],
      audienceMotivation: 'Entertainment consumption is seen as an educational and bonding activity, blending high-level external events with the sensory and developmental needs of the family.',
      actionableStrategy: {
        creativeHook: 'The Moments That Shape Them. Curate a Life Rich in Experience, Starting Today. Focus on the long-term emotional and educational value of shared media and activities.',
        mediaTargeting: 'Target high-end parenting/developmental blogs, local event listings, and educational content hubs. Use placement near content discussing "sensory play" or "cultural outings with kids".'
      }
    });

    // Party & Celebration Persona
    this.personaDatabase.set('party-celebration', {
      category: 'Home & Family',
      segmentId: 'PIA_2394',
      personaName: 'The Structured Social Manager',
      emoji: '🎉',
      coreInsight: 'Celebrations are Logistically Precise and Wellness-Focused. The top overlaps with Baby & Toddler Furniture and Fitness & Nutrition show that celebrations are treated with logistical precision and centered on the well-being and structure of the family.',
      creativeHooks: [
        'Celebrate with Confidence. Seamless Logistics for a Joyous, Stress-Free Event.',
        'Where Organization Meets Joy',
        'The Methodical Celebration Planner'
      ],
      mediaTargeting: [
        'Target home organization content, fitness/meal-prep apps, and specific event-planning forums for parents',
        'Run campaigns emphasizing high-quality, reusable items that fit a disciplined lifestyle',
        'Focus on organization, durability, and the ease of managing a perfect party setup'
      ],
      audienceMotivation: 'This buyer plans events with a methodical approach, ensuring safety, structure, and adherence to specific health standards even during moments of indulgence.',
      actionableStrategy: {
        creativeHook: 'Celebrate with Confidence. Seamless Logistics for a Joyous, Stress-Free Event. Focus on organization, durability, and the ease of managing a perfect party setup.',
        mediaTargeting: 'Target home organization content, fitness/meal-prep apps, and specific event-planning forums for parents. Run campaigns emphasizing high-quality, reusable items that fit a disciplined lifestyle.'
      }
    });

    // Baby & Toddler Persona
    this.personaDatabase.set('baby-toddler', {
      category: 'Home & Family',
      segmentId: 'PIA_2004',
      personaName: 'The Experiential Caregiver',
      emoji: '👶',
      coreInsight: 'Care is a Blend of Physical Needs and Mental Enrichment. The purchase intent is rooted in addressing both essential physical needs and developmental enrichment. This buyer approaches parenting holistically.',
      creativeHooks: [
        'Nourishment for Body and Mind. Building the Foundation for a Life of Discovery.',
        'Where Physical Care Meets Mental Growth',
        'The Holistic Parenting Approach'
      ],
      mediaTargeting: [
        'Target pediatric nutrition guidelines, sensory play tutorials, and content focused on early childhood development',
        'Contextual placement near premium food and media brands',
        'Focus on products that link physical health with cognitive or sensory development'
      ],
      audienceMotivation: 'This buyer views products as tools that contribute both to the child\'s nourishment and to their mental stimulation and sensory growth.',
      actionableStrategy: {
        creativeHook: 'Nourishment for Body and Mind. Building the Foundation for a Life of Discovery. Focus on products that link physical health with cognitive or sensory development.',
        mediaTargeting: 'Target pediatric nutrition guidelines, sensory play tutorials, and content focused on early childhood development. Contextual placement near premium food and media brands.'
      }
    });

    // Baby & Toddler Clothing Persona
    this.personaDatabase.set('baby-toddler-clothing', {
      category: 'Home & Family',
      segmentId: 'PIA_2152',
      personaName: 'The Functional Family Educator',
      emoji: '📚',
      coreInsight: 'Clothing is Functional Gear for a Literacy-Rich Environment. Clothing purchases are strongly correlated with Books and Media, suggesting apparel is seen as functional gear for an active, learning-rich environment.',
      creativeHooks: [
        'Ready for Adventure, Optimized for Learning. Gear for Their Next Milestone.',
        'Where Comfort Meets Development',
        'The Learning-Ready Wardrobe'
      ],
      mediaTargeting: [
        'Target early literacy blogs, children\'s book review sites, and educational toy retailers',
        'Use creative showing clothing in the context of reading or quiet learning time',
        'Focus on material safety, durability, and comfort during developmental activities like crawling and reading'
      ],
      audienceMotivation: 'This buyer ensures the child is comfortably dressed for focused playtime, sensory learning, and reading—prioritizing ease of movement, durability, and non-toxic materials.',
      actionableStrategy: {
        creativeHook: 'Ready for Adventure, Optimized for Learning. Gear for Their Next Milestone. Focus on material safety, durability, and comfort during developmental activities like crawling and reading.',
        mediaTargeting: 'Target early literacy blogs, children\'s book review sites, and educational toy retailers. Use creative showing clothing in the context of reading or quiet learning time.'
      }
    });

    // Baby Gift Sets Persona
    this.personaDatabase.set('baby-gift-sets', {
      category: 'Home & Family',
      segmentId: 'PIA_2004',
      personaName: 'The Intentional Gifting Caregiver',
      emoji: '🎁',
      coreInsight: 'Gifts Must Reflect Core Values of Practicality and Enrichment. The gifts they seek must deliver both practical necessity and meaningful enrichment. A gift set is viewed as a high-value, curated collection.',
      creativeHooks: [
        'The Ultimate Expression of Care. A Gift That Does More Than Delight: It Develops.',
        'Where Practicality Meets Meaning',
        'The Thoughtful Gift Curator'
      ],
      mediaTargeting: [
        'Target registry guides, baby shower planning content, and platforms that curate "best-of" lists for new parents',
        'Emphasize convenience and high-quality utility',
        'Focus on the long-term utility and developmental benefit of the gift set'
      ],
      audienceMotivation: 'This buyer\'s gifting reflects their core parenting values, seeking gifts that solve a real problem while also contributing to the child\'s development.',
      actionableStrategy: {
        creativeHook: 'The Ultimate Expression of Care. A Gift That Does More Than Delight: It Develops. Focus on the long-term utility and developmental benefit of the gift set.',
        mediaTargeting: 'Target registry guides, baby shower planning content, and platforms that curate "best-of" lists for new parents. Emphasize convenience and high-quality utility.'
      }
    });

    // Baby Health Persona
    this.personaDatabase.set('baby-health', {
      category: 'Home & Family',
      segmentId: 'PIA_2449',
      personaName: 'The Wellness-Obsessed Family Architect',
      emoji: '🩺',
      coreInsight: 'Health is a System Maintained with Vigilance and Enrichment. Health purchases are non-negotiable and integrated with all aspects of the child\'s care, extending to sensory enrichment.',
      creativeHooks: [
        'The Non-Negotiable Standard. Confidence in Care, Backed by Science, Nurtured by Enrichment.',
        'Where Health Meets Development',
        'The Vigilant Wellness Guardian'
      ],
      mediaTargeting: [
        'Target pediatric health authority content, non-toxic living blogs, and forums discussing baby allergies/dietary restrictions',
        'Use time-of-day targeting for late-night research sessions',
        'Focus on purity, efficacy, and the seamless integration into a structured, health-focused routine'
      ],
      audienceMotivation: 'This buyer is a meticulous planner who uses health products methodically, balancing medical/nutritional needs with the cognitive stimulation required for well-rounded development.',
      actionableStrategy: {
        creativeHook: 'The Non-Negotiable Standard. Confidence in Care, Backed by Science, Nurtured by Enrichment. Focus on purity, efficacy, and the seamless integration into a structured, health-focused routine.',
        mediaTargeting: 'Target pediatric health authority content, non-toxic living blogs, and forums discussing baby allergies/dietary restrictions. Use time-of-day targeting for late-night research sessions.'
      }
    });

    // Baby Safety Persona
    this.personaDatabase.set('baby-safety', {
      category: 'Home & Family',
      segmentId: 'PIA_2455',
      personaName: 'The Protective Domestic Logistician',
      emoji: '🔒',
      coreInsight: 'Safety is a Logistical System, Managed with Methodical Precision. Safety is the highest priority and is managed with the same methodical precision and organization as domestic resource management.',
      creativeHooks: [
        'Beyond Protection: Engineered for Peace of Mind. The Safest System is the Simplest System.',
        'Where Safety Meets Organization',
        'The Methodical Safety Planner'
      ],
      mediaTargeting: [
        'Target home organization/kitchen efficiency content, parental planning apps, and safety certification sites',
        'Emphasize the long-term, set-and-forget nature of the safety solution',
        'Focus on durability, ease of installation, and third-party testing/certification'
      ],
      audienceMotivation: 'This buyer is meticulous, organized, and focused on systematic processes in all aspects of home life. Safety products must be durable, reliable, and easily integrated into a structured home environment.',
      actionableStrategy: {
        creativeHook: 'Beyond Protection: Engineered for Peace of Mind. The Safest System is the Simplest System. Focus on durability, ease of installation, and third-party testing/certification.',
        mediaTargeting: 'Target home organization/kitchen efficiency content, parental planning apps, and safety certification sites. Emphasize the long-term, set-and-forget nature of the safety solution.'
      }
    });

    // Baby Toys & Activity Equipment Persona
    this.personaDatabase.set('baby-toys-activity', {
      category: 'Home & Family',
      segmentId: 'PIA_5580',
      personaName: 'The Restorative Engagement Provider',
      emoji: '🧸',
      coreInsight: 'Toys are Tools for Development and Restorative Routine. Toys and activity equipment are viewed as dual tools for engagement and critical developmental support.',
      creativeHooks: [
        'Play With Purpose. The Day\'s Engagement Defines the Night\'s Rest.',
        'Where Play Meets Development',
        'The Purposeful Play Curator'
      ],
      mediaTargeting: [
        'Target sleep-training resources, sensory development experts, and educational streaming content for young children',
        'Run campaigns focused on bedtime routines and developmental goals',
        'Focus on age-appropriate developmental claims and the product\'s role in building healthy sleep/wake cycles'
      ],
      audienceMotivation: 'This buyer prioritizes structured, healthy routines, using toys to stimulate development during the day and ensuring those activities lead to restorative sleep at night.',
      actionableStrategy: {
        creativeHook: 'Play With Purpose. The Day\'s Engagement Defines the Night\'s Rest. Focus on age-appropriate developmental claims and the product\'s role in building healthy sleep/wake cycles.',
        mediaTargeting: 'Target sleep-training resources, sensory development experts, and educational streaming content for young children. Run campaigns focused on bedtime routines and developmental goals.'
      }
    });

    // Baby Transport Persona
    this.personaDatabase.set('baby-transport', {
      category: 'Home & Family',
      segmentId: 'PIA_2478',
      personaName: 'The Connected Mobile Parent',
      emoji: '⚙️',
      coreInsight: 'Mobility is a High-Tech, Monitored System. Transport purchases are highly technical, focusing on connectivity, monitoring, and high-tech utility.',
      creativeHooks: [
        'The Smartest Way to Travel. Connected Safety, Engineered for the Digital Family.',
        'Where Technology Meets Mobility',
        'The Tech-Integrated Parent'
      ],
      mediaTargeting: [
        'Target tech review sites (especially for wearables and smart home devices), travel logistics blogs, and forums dedicated to high-end juvenile gear',
        'Emphasize data, connectivity, and performance standards',
        'Focus on integrated tech features, ease of digital monitoring, and seamless connection to mobile devices'
      ],
      audienceMotivation: 'This buyer relies heavily on modern technology for safety, monitoring, and communication while mobile. They seek maximum convenience and data integration.',
      actionableStrategy: {
        creativeHook: 'The Smartest Way to Travel. Connected Safety, Engineered for the Digital Family. Focus on integrated tech features, ease of digital monitoring, and seamless connection to mobile devices.',
        mediaTargeting: 'Target tech review sites (especially for wearables and smart home devices), travel logistics blogs, and forums dedicated to high-end juvenile gear. Emphasize data, connectivity, and performance standards.'
      }
    });

    // Diapering Persona
    this.personaDatabase.set('diapering', {
      category: 'Home & Family',
      segmentId: 'PIA_2488',
      personaName: 'The Core Logistics Manager',
      emoji: '🧺',
      coreInsight: 'Essential Care is Integrated with Fundamental Needs. Diapering purchases are routine, essential, and integrated directly with the non-negotiable, fundamental physical needs of the child.',
      creativeHooks: [
        'The Foundation of Comfort. Reliable Care for the Daily Non-Stop Routine.',
        'Where Reliability Meets Routine',
        'The Essential Care Provider'
      ],
      mediaTargeting: [
        'Target online grocery ordering platforms, bulk supply retailers, and content focusing on essential baby budget planning',
        'Use recurring subscription model promotions heavily, emphasizing convenience',
        'Focus on material absorption, leak protection, and cost-per-use efficiency'
      ],
      audienceMotivation: 'This buyer prioritizes bulk efficiency, safety, and a seamless routine. The purchase is a commitment to the most basic, high-frequency need of the child, demanding reliability and high performance.',
      actionableStrategy: {
        creativeHook: 'The Foundation of Comfort. Reliable Care for the Daily Non-Stop Routine. Focus on material absorption, leak protection, and cost-per-use efficiency.',
        mediaTargeting: 'Target online grocery ordering platforms, bulk supply retailers, and content focusing on essential baby budget planning. Use recurring subscription model promotions heavily, emphasizing convenience.'
      }
    });

    // Coffee Persona
    this.personaDatabase.set('coffee', {
      category: 'Food & Beverage',
      segmentId: 'PIA_3124',
      personaName: 'The Routine-Driven High-Performer',
      emoji: '🎯',
      coreInsight: 'Coffee is the Non-Negotiable Fuel for Peak Routine Efficiency. The buyer sees Coffee as the lynchpin of their day, necessary for maintaining focus on Household Supplies (logistical duties) and Exercise & Fitness (physical discipline).',
      creativeHooks: [
        'Fuel Your Discipline. The Essential Start to a Day Optimized for Results.',
        'Where Performance Meets Routine',
        'The High-Performance Fuel'
      ],
      mediaTargeting: [
        'Target productivity and organization blogs, professional development content, and high-intensity workout tracking apps',
        'Run campaigns during early morning hours when routines are established',
        'Focus on high-quality sourcing and energy yield as performance benefits'
      ],
      audienceMotivation: 'Their purchase motivation is reliability and superior energy yield. Coffee is viewed as essential fuel for maintaining both physical and mental performance throughout their disciplined daily routine.',
      actionableStrategy: {
        creativeHook: 'Fuel Your Discipline. The Essential Start to a Day Optimized for Results. Focus on high-quality sourcing and energy yield as performance benefits.',
        mediaTargeting: 'Target productivity and organization blogs, professional development content, and high-intensity workout tracking apps. Run campaigns during early morning hours when routines are established.'
      }
    });

    // Food Items Persona
    this.personaDatabase.set('food-items', {
      category: 'Food & Beverage',
      segmentId: 'PIA_3141',
      personaName: 'The Dual-Source Meal Curator',
      emoji: '🍽️',
      coreInsight: 'Convenience is Accepted, but Quality Experience is the Goal. This buyer balances the need for convenience with intentional, high-quality social/sensory experience. They are active meal curators, blending quick dining solutions with deliberate at-home preparation.',
      creativeHooks: [
        'The Ultimate Flavor. Quality Ingredients for a Life That Tastes Better.',
        'Where Convenience Meets Quality',
        'The Curated Culinary Experience'
      ],
      mediaTargeting: [
        'Target gourmet recipe sites, food review/critic blogs, and entertainment streaming platforms',
        'Use contextual placement near high-quality restaurant take-out or meal kit services',
        'Focus on the premium feel of the food, versatility, and its role in enhancing social moments'
      ],
      audienceMotivation: 'They ensure every food experience—whether delivered or made—is high-quality and satisfying. Food is viewed as both a necessity and an opportunity for sensory pleasure and social connection.',
      actionableStrategy: {
        creativeHook: 'The Ultimate Flavor. Quality Ingredients for a Life That Tastes Better. Focus on the premium feel of the food, versatility, and its role in enhancing social moments.',
        mediaTargeting: 'Target gourmet recipe sites, food review/critic blogs, and entertainment streaming platforms. Use contextual placement near high-quality restaurant take-out or meal kit services.'
      }
    });

    // Condiments & Sauces Persona
    this.personaDatabase.set('condiments-sauces', {
      category: 'Food & Beverage',
      segmentId: 'PIA_3160',
      personaName: 'The Accessible Flavor Novelist',
      emoji: '🌶️',
      coreInsight: 'Food Customization is a Low-Cost, High-Impact Creative Outlet. The strong, repeated overlap with Arts & Entertainment confirms that food preparation is viewed as a creative activity. Condiments and sauces are the low-cost, high-impact tools that allow this buyer to easily transform everyday meals.',
      creativeHooks: [
        'Your Secret Ingredient. Unlock Flavor Creativity in Minutes.',
        'Where Creativity Meets Flavor',
        'The Flavor Innovation Toolkit'
      ],
      mediaTargeting: [
        'Target DIY/craft content, short-form cooking videos focused on "hacks," and recipe platforms featuring global cuisine',
        'Emphasize inspiration and speed',
        'Focus on variety, unique flavor profiles, and the ease of customization'
      ],
      audienceMotivation: 'This buyer seeks to transform everyday meals into novel, personalized, and shareable sensory experiences, often catering to various tastes within the family. Food preparation is viewed as a creative outlet.',
      actionableStrategy: {
        creativeHook: 'Your Secret Ingredient. Unlock Flavor Creativity in Minutes. Focus on variety, unique flavor profiles, and the ease of customization.',
        mediaTargeting: 'Target DIY/craft content, short-form cooking videos focused on "hacks," and recipe platforms featuring global cuisine. Emphasize inspiration and speed.'
      }
    });

    // Cooking & Baking Ingredients Persona
    this.personaDatabase.set('cooking-baking-ingredients', {
      category: 'Food & Beverage',
      segmentId: 'PIA_3187',
      personaName: 'The Dedicated Home Ritualist',
      emoji: '🔪',
      coreInsight: 'Cooking is a Mindful, Focused, and Essential Hobby. Cooking is a deliberate, set-piece ritual requiring dedicated space and comfort. This buyer approaches the kitchen as a place for mindful focus and personal investment.',
      creativeHooks: [
        'The Art of the Craft. Ingredients as Essential as the Tools in Your Hand.',
        'Where Mindfulness Meets Mastery',
        'The Dedicated Culinary Artist'
      ],
      mediaTargeting: [
        'Target specialty cookware blogs, mindful living/meditation apps, and long-form baking tutorials',
        'Emphasize the quality of the raw material and the joy of the creation process',
        'Focus on ingredient purity, origin story, and the meticulous process of creation'
      ],
      audienceMotivation: 'This buyer is a hobbyist who values the process and equipment necessary for high-quality outcomes, not just the finished meal. Cooking is viewed as a form of meditation and personal expression.',
      actionableStrategy: {
        creativeHook: 'The Art of the Craft. Ingredients as Essential as the Tools in Your Hand. Focus on ingredient purity, origin story, and the meticulous process of creation.',
        mediaTargeting: 'Target specialty cookware blogs, mindful living/meditation apps, and long-form baking tutorials. Emphasize the quality of the raw material and the joy of the creation process.'
      }
    });

    // Dairy Products Persona
    this.personaDatabase.set('dairy-products', {
      category: 'Food & Beverage',
      segmentId: 'PIA_3224',
      personaName: 'The Functional Diet Manager',
      emoji: '🥛',
      coreInsight: 'Food is Functional Input for Appearance and Fitness Goals. Dairy is purchased primarily as a functional food source supporting a disciplined Exercise & Fitness regime. The secondary overlap with Skirts suggests an appearance/fashion consciousness that is directly tied to their fitness level.',
      creativeHooks: [
        'Performance Nutrition. The Clean Fuel Your Body Needs to Achieve Your Visual Goals.',
        'Where Function Meets Fitness',
        'The Performance-Focused Consumer'
      ],
      mediaTargeting: [
        'Target fitness influencers, diet and macronutrient tracking apps, and fashion content linked to body confidence and functional wear',
        'Use messaging that ties consumption to a visual result',
        'Focus on protein content, caloric efficiency, and supporting an active lifestyle'
      ],
      audienceMotivation: 'This buyer is making intentional dietary choices to manage their physical condition and visual presentation. Dairy products are viewed as functional nutrition that supports both fitness goals and appearance.',
      actionableStrategy: {
        creativeHook: 'Performance Nutrition. The Clean Fuel Your Body Needs to Achieve Your Visual Goals. Focus on protein content, caloric efficiency, and supporting an active lifestyle.',
        mediaTargeting: 'Target fitness influencers, diet and macronutrient tracking apps, and fashion content linked to body confidence and functional wear. Use messaging that ties consumption to a visual result.'
      }
    });

    // Beds & Accessories Persona
    this.personaDatabase.set('beds-accessories', {
      category: 'Home & Family',
      segmentId: 'PIA_3332',
      personaName: 'The Wellness & Performance Sleeper',
      emoji: '🛌',
      coreInsight: 'Restorative Sleep is a Performance Component, Tracked and Optimized. Cross-shopping with Athletics and Laptops indicates that this buyer views sleep not as downtime, but as a crucial, trackable pillar of their high-performance routine.',
      creativeHooks: [
        'Engineer Your Recovery. The Only Performance Gear You Use For Eight Hours Straight.',
        'Where Sleep Meets Performance',
        'The Data-Driven Sleeper'
      ],
      mediaTargeting: [
        'Target sleep-tracking apps, high-end fitness tech review sites, and productivity/business strategy content',
        'Position the product as a tool for achieving peak performance',
        'Focus on technical materials, temperature regulation, and verifiable sleep metrics'
      ],
      audienceMotivation: 'Their motivation is investing in the sanctuary (bed) that directly maximizes their physical performance and cognitive output. Sleep is viewed as a performance optimization tool.',
      actionableStrategy: {
        creativeHook: 'Engineer Your Recovery. The Only Performance Gear You Use For Eight Hours Straight. Focus on technical materials, temperature regulation, and verifiable sleep metrics.',
        mediaTargeting: 'Target sleep-tracking apps, high-end fitness tech review sites, and productivity/business strategy content. Position the product as a tool for achieving peak performance.'
      }
    });

    // Cookware & Bakeware Persona
    this.personaDatabase.set('cookware-bakeware', {
      category: 'Home & Family',
      segmentId: 'PIA_4487',
      personaName: 'The Proactive Family Meal Systemizer',
      emoji: '🍳',
      coreInsight: 'Kitchen Gear is Essential for Family Health and Logistical Order. The high overlap with Toys confirms the Family Manager persona. They require durable, safe, and efficient gear to facilitate batch cooking, meal preparation, and portion control.',
      creativeHooks: [
        'Fueling the Family System. Order and Health, Contained and Ready.',
        'Where Efficiency Meets Family Health',
        'The Systematic Family Chef'
      ],
      mediaTargeting: [
        'Target meal-prep communities for parents, healthy eating blogs, and family schedule/organization apps',
        'Use visuals that highlight ease of cleaning and healthy outcomes',
        'Focus on safety certifications, non-toxic claims, and versatility in simplifying complex family meal routines'
      ],
      audienceMotivation: 'This buyer is driven by health, order, and efficient meal management for a busy family. They need tools that help manage the family\'s nutritional and time logistics.',
      actionableStrategy: {
        creativeHook: 'Fueling the Family System. Order and Health, Contained and Ready. Focus on safety certifications, non-toxic claims, and versatility in simplifying complex family meal routines.',
        mediaTargeting: 'Target meal-prep communities for parents, healthy eating blogs, and family schedule/organization apps. Use visuals that highlight ease of cleaning and healthy outcomes.'
      }
    });

    // Food & Beverage Carriers Persona
    this.personaDatabase.set('food-beverage-carriers', {
      category: 'Home & Family',
      segmentId: 'PIA_4493',
      personaName: 'The Mobile Logistics Planner',
      emoji: '🥤',
      coreInsight: 'Intentional Consumption Requires Durable, Mobile Containment. Cross-shopping with Lawn & Garden and Skirts shows a buyer who needs durable, portable, and reliable containment that supports their active life outside the home.',
      creativeHooks: [
        'Your Lifestyle, Contained. Precision Carriers for Health and Convenience On the Move.',
        'Where Mobility Meets Health',
        'The On-the-Go Nutrition Planner'
      ],
      mediaTargeting: [
        'Target outdoor activity guides, meal-prep blogs focused on packed lunches, and content related to eco-friendly/sustainable living',
        'Focus on thermal performance, leak-proof design, and rugged durability for travel and outdoor use',
        'Emphasize health, convenience, and preventing waste while mobile'
      ],
      audienceMotivation: 'This buyer plans intentional consumption wherever they go. The purchases are focused on health, convenience, and preventing waste while maintaining an active lifestyle outside the home.',
      actionableStrategy: {
        creativeHook: 'Your Lifestyle, Contained. Precision Carriers for Health and Convenience On the Move. Focus on thermal performance, leak-proof design, and rugged durability for travel and outdoor use.',
        mediaTargeting: 'Target outdoor activity guides, meal-prep blogs focused on packed lunches, and content related to eco-friendly/sustainable living.'
      }
    });

    // Food Storage Accessories Persona
    this.personaDatabase.set('food-storage-accessories', {
      category: 'Home & Family',
      segmentId: 'PIA_4515',
      personaName: 'The Proactive Family Meal Systemizer',
      emoji: '🍱',
      coreInsight: 'Kitchen Gear is Essential for Family Health and Logistical Order. This buyer is highly focused on health, order, and efficient meal management. Cross-shopping with Cookware & Bakeware confirms their dedication to batch cooking, portion control, and non-toxic, safe containment.',
      creativeHooks: [
        'Fueling the Family System. Order and Health, Contained and Ready.',
        'Where Organization Meets Nutrition',
        'The Systematic Food Manager'
      ],
      mediaTargeting: [
        'Target meal-prep communities for parents, healthy eating blogs, and family schedule/organization apps',
        'Use creative that highlights safety certifications and portion control',
        'Focus on safety certifications, non-toxic claims, and stacking/organizational features for pantry and fridge efficiency'
      ],
      audienceMotivation: 'This buyer needs tools to manage the family\'s nutritional logistics through efficient storage, portion control, and safe containment. They prioritize health and organizational efficiency.',
      actionableStrategy: {
        creativeHook: 'Fueling the Family System. Order and Health, Contained and Ready. Focus on safety certifications, non-toxic claims, and stacking/organizational features for pantry and fridge efficiency.',
        mediaTargeting: 'Target meal-prep communities for parents, healthy eating blogs, and family schedule/organization apps. Use creative that highlights safety certifications and portion control.'
      }
    });

    // Lawn & Garden Persona
    this.personaDatabase.set('lawn-garden', {
      category: 'Home & Family',
      segmentId: 'PIA_4697',
      personaName: 'The Functional Home Asset Manager',
      emoji: '🏡',
      coreInsight: 'Home Effort is an Investment in Logistical Efficiency and Value. Cross-shopping with Household Supplies and Shoes suggests a practical individual who sees maintaining the home and garden as a core logistical chore requiring the right tools.',
      creativeHooks: [
        'Utility is the Ultimate Status. The Smartest Way to Get It Done.',
        'Where Efficiency Meets Home Value',
        'The Practical Home Optimizer'
      ],
      mediaTargeting: [
        'Target content focused on "best value," efficiency hacks, and property value maintenance',
        'Utilize contextual targeting around purchase guides and "vs." comparisons for utility goods',
        'Focus on durability, ease-of-maintenance, and low total cost of ownership (TCO) of the tools and supplies'
      ],
      audienceMotivation: 'This buyer demands products that are highly durable and contribute directly to the efficiency and long-term value of their primary asset (the home). They prioritize practical value over aesthetics.',
      actionableStrategy: {
        creativeHook: 'Utility is the Ultimate Status. The Smartest Way to Get It Done. Focus on durability, ease-of-maintenance, and low total cost of ownership (TCO) of the tools and supplies.',
        mediaTargeting: 'Target content focused on "best value," efficiency hacks, and property value maintenance. Utilize contextual targeting around purchase guides and "vs." comparisons for utility goods.'
      }
    });

    // Computers Persona
    this.personaDatabase.set('computers', {
      category: 'Technology',
      segmentId: 'PIA_2932',
      personaName: 'The Professional Digital Integrator',
      emoji: '🖥️',
      coreInsight: 'The Computer is the Locus of Productivity, Content, and Connectivity. The primary overlaps with Communications and Audio confirm that the computer is acquired to enable high-stakes digital tasks, complex content creation, and seamless connectivity.',
      creativeHooks: [
        'The Engine of Your Ambition. Performance Built for Tomorrow\'s Digital Demands.',
        'Where Power Meets Productivity',
        'The Professional Performance Engine'
      ],
      mediaTargeting: [
        'Target technical production forums (audio/video), high-end communication platform users (Slack/Teams power users), and content focused on digital workflow optimization',
        'Focus on processing speed, multitasking capability, and seamless content creation/streaming',
        'Emphasize raw power and reliability for critical professional and personal digital functions'
      ],
      audienceMotivation: 'This buyer demands raw power and reliability to execute critical professional and personal digital functions without lag. The computer is viewed as the central hub for all digital productivity.',
      actionableStrategy: {
        creativeHook: 'The Engine of Your Ambition. Performance Built for Tomorrow\'s Digital Demands. Focus on processing speed, multitasking capability, and seamless content creation/streaming.',
        mediaTargeting: 'Target technical production forums (audio/video), high-end communication platform users (Slack/Teams power users), and content focused on digital workflow optimization.'
      }
    });

    // Video Game Consoles Persona
    this.personaDatabase.set('video-game-consoles', {
      category: 'Entertainment',
      segmentId: 'PIA_3112',
      personaName: 'The Immersive Entertainment Architect',
      emoji: '🎮',
      coreInsight: 'Gaming is an Immersive Experience Demanding Perfect Setup and Comfort. The high overlaps with Electronics Accessories and Chairs confirm that the purchase of a console is tied to acquiring the best physical and peripheral setup.',
      creativeHooks: [
        'Beyond the Screen. Engineered for Total Immersion and Zero Fatigue.',
        'Where Gaming Meets Comfort',
        'The Immersive Experience Builder'
      ],
      mediaTargeting: [
        'Target gaming setup/streaming content, ergonomic home office product reviewers, and content focused on A/V integration and high-fidelity audio',
        'Focus on console performance, ergonomic comfort, and peripheral quality as a path to a superior competitive/story experience',
        'Emphasize total environmental optimization for distraction-free gaming'
      ],
      audienceMotivation: 'They are architects of their entertainment space, demanding comfort, high-quality audio/visual peripherals, and technical enhancements to achieve a premium, distraction-free experience.',
      actionableStrategy: {
        creativeHook: 'Beyond the Screen. Engineered for Total Immersion and Zero Fatigue. Focus on console performance, ergonomic comfort, and peripheral quality as a path to a superior competitive/story experience.',
        mediaTargeting: 'Target gaming setup/streaming content, ergonomic home office product reviewers, and content focused on A/V integration and high-fidelity audio.'
      }
    });

    // Software Persona
    this.personaDatabase.set('software', {
      category: 'Technology',
      segmentId: 'PIA_2018',
      personaName: 'The Mobile Performance Enabler',
      emoji: '⚙️',
      coreInsight: 'Software is a Tool for Maximizing Efficiency in a Highly Mobile Life. High overlaps with Shoes, Laptops, and Athletics confirm a highly mobile and physically active professional.',
      creativeHooks: [
        'Digital Tools for a Life on the Move. Maximize Your Output, Maintain Your Pace.',
        'Where Mobility Meets Productivity',
        'The Mobile Professional\'s Toolkit'
      ],
      mediaTargeting: [
        'Target high-end travel/backpacking gear reviews, mobile productivity apps, and content focused on achieving work-life balance through technology',
        'Focus on cloud syncing, mobile access, data integration, and time-saving features',
        'Emphasize tools that facilitate work/life balance, data tracking, and seamless performance continuity'
      ],
      audienceMotivation: 'The software purchase is motivated by the need for tools that facilitate work/life balance, data tracking, and seamless performance continuity whether they are at their desk or engaged in physical activity.',
      actionableStrategy: {
        creativeHook: 'Digital Tools for a Life on the Move. Maximize Your Output, Maintain Your Pace. Focus on cloud syncing, mobile access, data integration, and time-saving features.',
        mediaTargeting: 'Target high-end travel/backpacking gear reviews, mobile productivity apps, and content focused on achieving work-life balance through technology.'
      }
    });

    // Computer Software Persona
    this.personaDatabase.set('computer-software', {
      category: 'Technology',
      segmentId: 'PIA_5123',
      personaName: 'The System-Critical Asset Manager',
      emoji: '💾',
      coreInsight: 'Reliability of Digital Tools is Non-Negotiable for High-Value Systems. The primary overlap with Software and Vehicles & Parts shows they link digital asset integrity to the reliability of critical, high-value physical systems.',
      creativeHooks: [
        'Engineered for Reliability. The Foundation That Drives Your Most Valuable Assets.',
        'Where Reliability Meets Performance',
        'The System Integrity Guardian'
      ],
      mediaTargeting: [
        'Target automotive repair and maintenance forums, IT security blogs focused on system reliability, and content related to digital backup/redundancy solutions',
        'Focus on update consistency, stability, and compatibility across multiple devices and operating systems',
        'Emphasize guaranteed functionality, longevity, and smooth operation across integrated digital and physical assets'
      ],
      audienceMotivation: 'This buyer views software as a core utility that must be utterly reliable. Their primary motivation is guaranteed functionality, longevity, and smooth operation across their integrated digital and physical assets.',
      actionableStrategy: {
        creativeHook: 'Engineered for Reliability. The Foundation That Drives Your Most Valuable Assets. Focus on update consistency, stability, and compatibility across multiple devices and operating systems.',
        mediaTargeting: 'Target automotive repair and maintenance forums, IT security blogs focused on system reliability, and content related to digital backup/redundancy solutions.'
      }
    });

    // Business & Productivity Software Persona
    this.personaDatabase.set('business-productivity-software', {
      category: 'Technology',
      segmentId: 'PIA_5125',
      personaName: 'The Executive Learning & Display Hub',
      emoji: '📊',
      coreInsight: 'Tools are Acquired to Enhance Learning, Communication, and Professional Growth. Overlaps with Televisions and Books indicate that software is acquired to enhance both knowledge acquisition and high-impact professional presentation.',
      creativeHooks: [
        'From Insight to Impact. The Tools That Transform Knowledge into Presentation.',
        'Where Learning Meets Leadership',
        'The Executive Performance Engine'
      ],
      mediaTargeting: [
        'Target professional development webinars, executive summary services, and business news platforms that feature data analysis and leadership content',
        'Focus on seamless presentation features, collaborative capability, and data visualization',
        'Emphasize continuous learning, effective communication, and the visible success of their projects'
      ],
      audienceMotivation: 'This buyer is driven by continuous learning, effective communication, and the visible success of their projects. Software is viewed as a tool for optimizing professional output.',
      actionableStrategy: {
        creativeHook: 'From Insight to Impact. The Tools That Transform Knowledge into Presentation. Focus on seamless presentation features, collaborative capability, and data visualization.',
        mediaTargeting: 'Target professional development webinars, executive summary services, and business news platforms that feature data analysis and leadership content.'
      }
    });

    // Antivirus & Security Software Persona
    this.personaDatabase.set('antivirus-security-software', {
      category: 'Technology',
      segmentId: 'PIA_5124',
      personaName: 'The Mindful Digital Guardian',
      emoji: '🛡️',
      coreInsight: 'Security Enables a Disciplined Life of Optimization and Leisure. Security is purchased to enable a digital life that blends high-engagement leisure with personal optimization.',
      creativeHooks: [
        'Security You Forget. Protection That Lets You Focus on What Matters: Health, Hobbies, and Performance.',
        'Where Security Meets Lifestyle',
        'The Invisible Protection Guardian'
      ],
      mediaTargeting: [
        'Target specialized gaming forums, wellness and self-care apps, and content focused on achieving fitness goals',
        'Position security as a foundational element of their "optimized life"',
        'Focus on background reliability, zero system drag, and privacy guarantees'
      ],
      audienceMotivation: 'This buyer is disciplined and active, demanding that their security solutions be discreet, reliable, and invisible, ensuring their focus remains on achieving their health and leisure goals, not digital threats.',
      actionableStrategy: {
        creativeHook: 'Security You Forget. Protection That Lets You Focus on What Matters: Health, Hobbies, and Performance. Focus on background reliability, zero system drag, and privacy guarantees.',
        mediaTargeting: 'Target specialized gaming forums, wellness and self-care apps, and content focused on achieving fitness goals. Position security as a foundational element of their "optimized life".'
      }
    });

    // Electronics Persona
    this.personaDatabase.set('electronics', {
      category: 'Technology',
      segmentId: 'PIA_2007',
      personaName: 'The Connected Lifestyle Curator',
      emoji: '🌐',
      coreInsight: 'High-Quality Systems for Comprehensive Media and Content Integration. Overlaps with Electronics Accessories and Video confirm that core electronic purchases are deeply integrated with content consumption and demand the supporting peripherals for a premium experience.',
      creativeHooks: [
        'Beyond the Device. The Ecosystem That Brings Your Content to Life.',
        'Where Technology Meets Lifestyle',
        'The Connected Experience Architect'
      ],
      mediaTargeting: [
        'Target high-end A/V review sites, forums discussing smart home connectivity, and content related to premium streaming services and 4K/8K media',
        'Focus on connectivity standards, seamless integration across devices, and superior audio/visual fidelity',
        'Emphasize creating a complete, high-quality, interconnected system'
      ],
      audienceMotivation: 'This buyer is curating a highly functional, high-fidelity media and connectivity environment. They demand the supporting peripherals for a premium experience.',
      actionableStrategy: {
        creativeHook: 'Beyond the Device. The Ecosystem That Brings Your Content to Life. Focus on connectivity standards, seamless integration across devices, and superior audio/visual fidelity.',
        mediaTargeting: 'Target high-end A/V review sites, forums discussing smart home connectivity, and content related to premium streaming services and 4K/8K media.'
      }
    });

    // Educational Software Persona
    this.personaDatabase.set('educational-software', {
      category: 'Technology',
      segmentId: 'PIA_5129',
      personaName: 'The Systemic Learning Administrator',
      emoji: '🧠',
      coreInsight: 'Learning is a Structured Process Requiring Seamless Technical Infrastructure. The extreme overlaps with Electronics Accessories and Networking confirm that they prioritize a reliable, robust technological infrastructure.',
      creativeHooks: [
        'The Learning Never Stops. Reliable Tech for Uninterrupted Educational Excellence.',
        'Where Technology Meets Education',
        'The Continuous Learning Enabler'
      ],
      mediaTargeting: [
        'Target e-learning platform reviews, remote work productivity content, and forums discussing home network stability and educational hardware',
        'Focus on platform stability, multi-device access, and guaranteed connectivity features',
        'Emphasize educational purchases as systems-focused, demanding seamless integration with reliable hardware and connectivity'
      ],
      audienceMotivation: 'This buyer is committed to a structured, uninterrupted learning process. Educational purchases are systems-focused, demanding that the software works seamlessly with reliable hardware and connectivity.',
      actionableStrategy: {
        creativeHook: 'The Learning Never Stops. Reliable Tech for Uninterrupted Educational Excellence. Focus on platform stability, multi-device access, and guaranteed connectivity features.',
        mediaTargeting: 'Target e-learning platform reviews, remote work productivity content, and forums discussing home network stability and educational hardware.'
      }
    });

    // Cameras & Optics Persona
    this.personaDatabase.set('cameras-optics', {
      category: 'Technology',
      segmentId: 'PIA_2006',
      personaName: 'The Experiential Memory Recorder',
      emoji: '📸',
      coreInsight: 'Gear is for Capturing and Preserving High-Value Social and Travel Moments. The overlaps with Toys and Vehicles confirm that this gear is primarily used to record valuable, often fleeting, family moments and shared adventures/travel.',
      creativeHooks: [
        'Freeze the Moment, Live the Memory. The Precision Tool for Irreplaceable Moments.',
        'Where Technology Meets Memory',
        'The Moment Preservation Specialist'
      ],
      mediaTargeting: [
        'Target family travel blogs, social media accounts focused on scrapbooking/memory keeping, and content related to adventure vehicle modification or family road trips',
        'Focus on image quality, durability for travel, and ease of use in spontaneous situations',
        'Emphasize the investment in preserving high-value experiences and sharing those memories'
      ],
      audienceMotivation: 'The purchase is an investment in preserving high-value experiences and sharing those memories. This buyer is motivated by memory preservation and experiential capture.',
      actionableStrategy: {
        creativeHook: 'Freeze the Moment, Live the Memory. The Precision Tool for Irreplaceable Moments. Focus on image quality, durability for travel, and ease of use in spontaneous situations.',
        mediaTargeting: 'Target family travel blogs, social media accounts focused on scrapbooking/memory keeping, and content related to adventure vehicle modification or family road trips.'
      }
    });

    // Business & Industrial Persona
    this.personaDatabase.set('business-industrial', {
      category: 'Business',
      segmentId: 'PIA_2005',
      personaName: 'The Mobile Professional Asset Holder',
      emoji: '💼',
      coreInsight: 'High-Quality Assets Supporting a Disciplined and Mobile Career. Overlaps with Shaving & Grooming and Luggage & Bags show a focus on professional presentation and logistical efficiency.',
      creativeHooks: [
        'Tools for the Professional. Assets That Maintain Your Efficiency and Your Image.',
        'Where Professionalism Meets Mobility',
        'The Mobile Professional\'s Asset Manager'
      ],
      mediaTargeting: [
        'Target trade industry publications, content focused on fleet management or logistics, and professional networking sites that discuss essential gear for field work',
        'Focus on durability, reliability in the field, and the long-term ROI of purchasing high-quality professional assets',
        'Emphasize maintaining efficiency and image while on the go'
      ],
      audienceMotivation: 'Their B&I purchases (tools, services) are viewed as necessary, high-quality assets that maintain their efficiency and image while on the go. This buyer invests in assets that support a disciplined, mobile career.',
      actionableStrategy: {
        creativeHook: 'Tools for the Professional. Assets That Maintain Your Efficiency and Your Image. Focus on durability, reliability in the field, and the long-term ROI of purchasing high-quality professional assets.',
        mediaTargeting: 'Target trade industry publications, content focused on fleet management or logistics, and professional networking sites that discuss essential gear for field work.'
      }
    });

    // Office Supplies Persona
    this.personaDatabase.set('office-supplies', {
      category: 'Business',
      segmentId: 'PIA_2016',
      personaName: 'The Wellness-Driven Productivity Manager',
      emoji: '🧠',
      coreInsight: 'Office Tools Support Cognitive Performance and Work-Life Balance. The high overlaps with Sleeping Aids and Non-Dairy Milk confirm this buyer links their office setup directly to their health and wellness routine.',
      creativeHooks: [
        'Optimize Your Output. The Tools That Protect Your Health and Power Your Focus.',
        'Where Productivity Meets Wellness',
        'The Cognitive Performance Optimizer'
      ],
      mediaTargeting: [
        'Target wellness and biohacking content, productivity platforms that track sleep/work cycles, and healthy eating blogs',
        'Focus on ergonomic design, organization for stress reduction, and linking purchases to better sleep/dietary planning',
        'Emphasize office supplies as functional tools for maintaining focus, energy, and work-life balance'
      ],
      audienceMotivation: 'Office supplies are viewed as functional tools for maintaining focus, energy, and work-life balance, essential for protecting their physical and mental performance.',
      actionableStrategy: {
        creativeHook: 'Optimize Your Output. The Tools That Protect Your Health and Power Your Focus. Focus on ergonomic design, organization for stress reduction, and linking purchases to better sleep/dietary planning.',
        mediaTargeting: 'Target wellness and biohacking content, productivity platforms that track sleep/work cycles, and healthy eating blogs.'
      }
    });

    // Athletics Persona
    this.personaDatabase.set('athletics', {
      category: 'Sports',
      segmentId: 'PIA_5158',
      personaName: 'The Data-Optimized Performance Athlete',
      emoji: '💻',
      coreInsight: 'Fitness is Measured, Tracked, and Fueled by Technical Gear. Overlaps with Laptops and Sporting Goods confirm that the buyer uses high-end electronics for performance analysis and tracking.',
      creativeHooks: [
        'The Pursuit of Precision. Gear That Performs and the Tech That Proves It.',
        'Where Performance Meets Data',
        'The Technical Performance Optimizer'
      ],
      mediaTargeting: [
        'Target technical running/cycling forums, fitness data tracking apps (Strava/Garmin), and content focused on performance wearables',
        'Focus on technical specifications, compatibility with tracking software, and linking performance to professional success',
        'Emphasize competitive mindset and viewing every piece of gear as an input into a system designed for measurable improvement'
      ],
      audienceMotivation: 'This persona is competitive, viewing every piece of gear as an input into a system designed for measurable improvement, where technology is as critical as physical training.',
      actionableStrategy: {
        creativeHook: 'The Pursuit of Precision. Gear That Performs and the Tech That Proves It. Focus on technical specifications, compatibility with tracking software, and linking performance to professional success.',
        mediaTargeting: 'Target technical running/cycling forums, fitness data tracking apps (Strava/Garmin), and content focused on performance wearables.'
      }
    });

    // Exercise & Fitness Persona
    this.personaDatabase.set('exercise-fitness', {
      category: 'Sports',
      segmentId: 'PIA_5317',
      personaName: 'The Integrated Life Systemist',
      emoji: '👟',
      coreInsight: 'Physical Activity Bridges the Gap Between Digital and Physical Performance. Overlaps with Laptops and Shoes confirm that their physical activity is tied directly to their digital life and mobility.',
      creativeHooks: [
        'The Seamless Transition. Performance Gear for Your Full-Spectrum Life.',
        'Where Digital Meets Physical',
        'The Integrated Performance System'
      ],
      mediaTargeting: [
        'Target remote work productivity guides, ergonomic home office setup reviews, and blogs discussing minimalist/functional footwear',
        'Focus on versatility, durability, and the ease of transitioning from work to workout',
        'Emphasize exercise gear as a technical investment that allows seamless transition between high-output cognitive work and physical training'
      ],
      audienceMotivation: 'Exercise gear is not just for the gym; it\'s a technical investment that allows them to seamlessly transition between high-output cognitive work and physical training, maximizing efficiency and capability across all facets of their schedule.',
      actionableStrategy: {
        creativeHook: 'The Seamless Transition. Performance Gear for Your Full-Spectrum Life. Focus on versatility, durability, and the ease of transitioning from work to workout.',
        mediaTargeting: 'Target remote work productivity guides, ergonomic home office setup reviews, and blogs discussing minimalist/functional footwear.'
      }
    });

    // Yoga & Pilates Persona
    this.personaDatabase.set('yoga-pilates', {
      category: 'Wellness',
      segmentId: 'PIA_5353',
      personaName: 'The Mindful Home Manager',
      emoji: '🧘‍♀️',
      coreInsight: 'Holistic Balance Supports Both Domestic and Digital Life. Overlaps with Household Supplies and Laptops show a buyer focused on achieving a holistic balance—using mindful physical activity to support both the logistical management of the home and their high-output cognitive/digital life.',
      creativeHooks: [
        'Clarity and Core. The Foundation for Your Focus, On the Mat and Off.',
        'Where Mindfulness Meets Productivity',
        'The Holistic Balance Seeker'
      ],
      mediaTargeting: [
        'Target mindfulness apps, home organization systems, and content related to clean eating/slow living',
        'Focus on quality materials, non-slip performance, and the ability of the practice to reduce stress and enhance productivity',
        'Emphasize gear that promotes focus, comfort, and is easily integrated into a clean home environment'
      ],
      audienceMotivation: 'They demand gear that promotes focus, comfort, and is easily integrated into a clean home environment. The practice is integrated into the domestic routine to achieve holistic balance.',
      actionableStrategy: {
        creativeHook: 'Clarity and Core. The Foundation for Your Focus, On the Mat and Off. Focus on quality materials, non-slip performance, and the ability of the practice to reduce stress and enhance productivity.',
        mediaTargeting: 'Target mindfulness apps, home organization systems, and content related to clean eating/slow living.'
      }
    });

    // Indoor Games Persona
    this.personaDatabase.set('indoor-games', {
      category: 'Entertainment',
      segmentId: 'PIA_5359',
      personaName: 'The Custom Entertainment Builder',
      emoji: '🕹️',
      coreInsight: 'Indoor Leisure is a Customized, High-Tech Entertainment Experience. Overlaps with Entertainment Centers & TV Stands and Components indicate that leisure is a high-tech pursuit.',
      creativeHooks: [
        'Engineer Your Escape. The Components That Define Your Dedicated Entertainment Space.',
        'Where Technology Meets Leisure',
        'The Entertainment System Architect'
      ],
      mediaTargeting: [
        'Target home theater enthusiasts, DIY furniture/assembly guides, and technology blogs focused on audio/visual setup',
        'Focus on compatibility, high-fidelity setup, and durable peripherals for long-term use',
        'Emphasize building a comprehensive entertainment environment with high-tech components'
      ],
      audienceMotivation: 'This buyer is a Custom Builder, investing in the physical structure and peripherals necessary to achieve a dedicated, high-quality, and immersive domestic leisure experience.',
      actionableStrategy: {
        creativeHook: 'Engineer Your Escape. The Components That Define Your Dedicated Entertainment Space. Focus on compatibility, high-fidelity setup, and durable peripherals for long-term use.',
        mediaTargeting: 'Target home theater enthusiasts, DIY furniture/assembly guides, and technology blogs focused on audio/visual setup.'
      }
    });

    // Outdoor Recreation Persona
    this.personaDatabase.set('outdoor-recreation', {
      category: 'Sports',
      segmentId: 'PIA_5401',
      personaName: 'The Mobile, Gear-Centric Adventurer',
      emoji: '⛰️',
      coreInsight: 'Activity is Fueled by Highly Functional Gear and Digital Planning. Overlaps with Shoes and Laptops confirm that outdoor activity is planned digitally and executed with highly functional gear.',
      creativeHooks: [
        'The Essential Link. Gear That Won\'t Fail You, Data That Guides You.',
        'Where Adventure Meets Technology',
        'The Digital Adventure Planner'
      ],
      mediaTargeting: [
        'Target trail mapping apps, outdoor survival blogs, and content focused on ruggedized tech and high-performance hiking/running shoes',
        'Focus on durability, weight, and the product\'s role in digital safety and planning',
        'Emphasize functional necessity and demanding durability, light weight, and reliable tech to support expeditions'
      ],
      audienceMotivation: 'This buyer is a Mobile, Gear-Centric Adventurer, demanding durability, light weight, and reliable tech to support their expeditions.',
      actionableStrategy: {
        creativeHook: 'The Essential Link. Gear That Won\'t Fail You, Data That Guides You. Focus on durability, weight, and the product\'s role in digital safety and planning.',
        mediaTargeting: 'Target trail mapping apps, outdoor survival blogs, and content focused on ruggedized tech and high-performance hiking/running shoes.'
      }
    });

    // Camping & Hiking Persona
    this.personaDatabase.set('camping-hiking', {
      category: 'Sports',
      segmentId: 'PIA_5412',
      personaName: 'The Prepared Comfort Adventurer',
      emoji: '⛺',
      coreInsight: 'Adventure is a Blend of Rugged Experience and Deliberate Comfort. Overlaps with Speakers and Shaving & Grooming indicate they intentionally bring their creature comforts into the wild.',
      creativeHooks: [
        'Experience the Wild, Never Sacrifice the Ritual. Performance Gear for Civilized Adventure.',
        'Where Adventure Meets Comfort',
        'The Comfortable Adventurer'
      ],
      mediaTargeting: [
        'Target travel blogs focusing on glamping/luxury camping, portable speaker reviews, and content on self-care routines for men/women on the go',
        'Focus on lightweight design, durability, and features that enhance personal routine and atmosphere',
        'Emphasize gear that performs reliably while enhancing the restorative, personalized feel of the experience'
      ],
      audienceMotivation: 'They are Prepared Comfort Adventurers, seeking gear that performs reliably while enhancing the restorative, personalized feel of the experience. They view the outdoor experience as a blend of challenge and deliberate comfort.',
      actionableStrategy: {
        creativeHook: 'Experience the Wild, Never Sacrifice the Ritual. Performance Gear for Civilized Adventure. Focus on lightweight design, durability, and features that enhance personal routine and atmosphere.',
        mediaTargeting: 'Target travel blogs focusing on glamping/luxury camping, portable speaker reviews, and content on self-care routines for men/women on the go.'
      }
    });

    // Sporting Goods Persona
    this.personaDatabase.set('sporting-goods', {
      category: 'Sports',
      segmentId: 'PIA_2019',
      personaName: 'The Competitive Gear Strategist',
      emoji: '🏆',
      coreInsight: 'Purchases are Driven by Technical Advantage and Competitive Output. Overlaps with Shoes and Laptops confirm that purchases are focused on gaining a technical advantage and enhancing strategy through analytical tracking.',
      creativeHooks: [
        'The Edge is Technical. Gear That Translates Data into Dominance.',
        'Where Competition Meets Technology',
        'The Technical Advantage Seeker'
      ],
      mediaTargeting: [
        'Target specialist sport coaching forums, competition tracking apps, and content focused on advanced skill drills and training regimens',
        'Focus on material innovation, technical superiority, and performance-tracking integration',
        'Emphasize sporting goods as high-value tools essential for competitive success'
      ],
      audienceMotivation: 'This buyer is a Competitive Strategist, viewing sporting goods as high-value tools essential for competitive success. Purchases are deeply integrated into a competitive mindset.',
      actionableStrategy: {
        creativeHook: 'The Edge is Technical. Gear That Translates Data into Dominance. Focus on material innovation, technical superiority, and performance-tracking integration.',
        mediaTargeting: 'Target specialist sport coaching forums, competition tracking apps, and content focused on advanced skill drills and training regimens.'
      }
    });

    // Toys & Games Persona
    this.personaDatabase.set('toys-games', {
      category: 'Family',
      segmentId: 'PIA_2020',
      personaName: 'The Tech-Focused Family Engineer',
      emoji: '🔬',
      coreInsight: 'Play is Developmental, Integrated with Technology and Home Systems. Overlaps with Circuit Boards & Components and Networking confirm that the family lives in a high-tech domestic environment.',
      creativeHooks: [
        'Build Their Future. Toys That Integrate Play with Logic and Code.',
        'Where Learning Meets Technology',
        'The STEM Family Educator'
      ],
      mediaTargeting: [
        'Target STEM education resources, forums for hobbyist electronics, and content focused on building robust home networks and smart learning environments',
        'Focus on developmental claims, engineering concepts, and seamless digital integration',
        'Emphasize toys as developmental tools integrated with complex technology, reflecting a focus on STEM learning'
      ],
      audienceMotivation: 'Toys are seen as developmental tools integrated with complex technology, reflecting a focus on STEM learning, digital connectivity, and advanced problem-solving from an early age.',
      actionableStrategy: {
        creativeHook: 'Build Their Future. Toys That Integrate Play with Logic and Code. Focus on developmental claims, engineering concepts, and seamless digital integration.',
        mediaTargeting: 'Target STEM education resources, forums for hobbyist electronics, and content focused on building robust home networks and smart learning environments.'
      }
    });

    // Toys Persona
    this.personaDatabase.set('toys', {
      category: 'Family',
      segmentId: 'PIA_5580',
      personaName: 'The Restorative Family Planner',
      emoji: '💤',
      coreInsight: 'Play Facilitates Structure and Supports Restorative Routines. Overlaps with Media and Sleeping Aids confirm that toys are tools for both high-quality, structured engagement and for supporting the development of healthy, restorative routines.',
      creativeHooks: [
        'Play With Purpose. The Day\'s Engagement Defines the Night\'s Rest.',
        'Where Play Meets Rest',
        'The Family Routine Optimizer'
      ],
      mediaTargeting: [
        'Target sleep-training resources, family routine planning apps, and educational streaming content for young children',
        'Run campaigns focused on bedtime and quiet time routines',
        'Focus on developmental claims related to calm, focused play and the product\'s role in a reliable bedtime routine'
      ],
      audienceMotivation: 'This buyer is a Restorative Family Planner, optimizing the day\'s activity to lead directly to efficient rest. The purpose of toys is tied to facilitating healthy structure and rest.',
      actionableStrategy: {
        creativeHook: 'Play With Purpose. The Day\'s Engagement Defines the Night\'s Rest. Focus on developmental claims related to calm, focused play and the product\'s role in a reliable bedtime routine.',
        mediaTargeting: 'Target sleep-training resources, family routine planning apps, and educational streaming content for young children. Run campaigns focused on bedtime and quiet time routines.'
      }
    });
  }

  /**
   * Match a deal to a persona based on its name
   */
  matchDealToPersona(dealName: string): PersonaInsights | null {
    const nameLower = dealName.toLowerCase();
    
    // Only match Commerce Audience deals (those with "Purchase Intender" in the name)
    if (!nameLower.includes('purchase intender')) {
      return null;
    }
    
    // Food Storage matching
    if (nameLower.includes('food storage') || nameLower.includes('food prep') || nameLower.includes('meal prep')) {
      return this.personaDatabase.get('food-storage') || null;
    }
    
    // Golf matching
    if (nameLower.includes('golf') || nameLower.includes('sports equipment') || nameLower.includes('athletic')) {
      return this.personaDatabase.get('golf') || null;
    }
    
    // Home and Garden matching
    if (nameLower.includes('home') && (nameLower.includes('garden') || nameLower.includes('lawn') || nameLower.includes('outdoor'))) {
      return this.personaDatabase.get('home-garden') || null;
    }
    
    // Condiments and Sauces matching
    if (nameLower.includes('condiments') || nameLower.includes('sauces') || nameLower.includes('spices') || nameLower.includes('flavor')) {
      return this.personaDatabase.get('condiments-sauces') || null;
    }
    
    // Baby Health matching
    if (nameLower.includes('baby') && (nameLower.includes('health') || nameLower.includes('wellness') || nameLower.includes('nutrition'))) {
      return this.personaDatabase.get('baby-health') || null;
    }
    
    // Personal Care matching
    if (nameLower.includes('personal care') || nameLower.includes('personal hygiene') || nameLower.includes('grooming')) {
      return this.personaDatabase.get('personal-care') || null;
    }
    
    // Cosmetics matching
    if (nameLower.includes('cosmetics') || nameLower.includes('makeup') || nameLower.includes('beauty products')) {
      return this.personaDatabase.get('cosmetics') || null;
    }
    
    // Health & Beauty matching
    if (nameLower.includes('health') && nameLower.includes('beauty')) {
      return this.personaDatabase.get('health-beauty') || null;
    }
    
    // Fitness & Nutrition matching (using nuts, seeds, protein, supplements as proxies)
    if (nameLower.includes('nuts') || nameLower.includes('seeds') || nameLower.includes('protein') || 
        nameLower.includes('supplements') || nameLower.includes('nutrition') || nameLower.includes('energy')) {
      return this.personaDatabase.get('fitness-nutrition') || null;
    }
    
    // Fitness matching
    if (nameLower.includes('fitness') || nameLower.includes('exercise') || nameLower.includes('workout') || 
        nameLower.includes('gym') || nameLower.includes('athletic') || nameLower.includes('sports equipment')) {
      return this.personaDatabase.get('fitness') || null;
    }
    
    // Additional category matching for broader coverage
    if (nameLower.includes('beauty') && !nameLower.includes('baby')) {
      // Match to cosmetics for general beauty products
      return this.personaDatabase.get('cosmetics') || null;
    }
    
    if (nameLower.includes('wellness') && !nameLower.includes('baby')) {
      // Match to health-beauty for general wellness products
      return this.personaDatabase.get('health-beauty') || null;
    }
    
    // Pet Supplies matching
    if (nameLower.includes('pet supplies') || nameLower.includes('pet care') || nameLower.includes('animal supplies')) {
      return this.personaDatabase.get('pet-supplies') || null;
    }
    
    // Animals & Pet Supplies matching
    if (nameLower.includes('animals') && nameLower.includes('pet')) {
      return this.personaDatabase.get('animals-pet-supplies') || null;
    }
    
    // Cat Supplies matching
    if (nameLower.includes('cat') || nameLower.includes('feline') || nameLower.includes('kitten')) {
      return this.personaDatabase.get('cat-supplies') || null;
    }
    
    // Dog Supplies matching
    if (nameLower.includes('dog') || nameLower.includes('canine') || nameLower.includes('puppy')) {
      return this.personaDatabase.get('dog-supplies') || null;
    }
    
    // Pet Owners matching (general pet-related terms)
    if (nameLower.includes('pet') && !nameLower.includes('supplies') && !nameLower.includes('care')) {
      return this.personaDatabase.get('pet-owners') || null;
    }
    
    // Activewear matching
    if (nameLower.includes('activewear') || nameLower.includes('athletic wear') || nameLower.includes('workout clothes') || 
        nameLower.includes('gym wear') || nameLower.includes('sportswear') || nameLower.includes('performance wear')) {
      return this.personaDatabase.get('activewear') || null;
    }
    
    // Dresses matching
    if (nameLower.includes('dress') || nameLower.includes('dresses') || nameLower.includes('formal wear') || 
        nameLower.includes('evening wear') || nameLower.includes('occasion wear')) {
      return this.personaDatabase.get('dresses') || null;
    }
    
    // Shirts & Tops matching
    if (nameLower.includes('shirt') || nameLower.includes('shirts') || nameLower.includes('top') || nameLower.includes('tops') || 
        nameLower.includes('blouse') || nameLower.includes('t-shirt') || nameLower.includes('tshirt')) {
      return this.personaDatabase.get('shirts-tops') || null;
    }
    
    // Clothing Accessories matching
    if (nameLower.includes('accessories') || nameLower.includes('belt') || nameLower.includes('belts') || 
        nameLower.includes('scarf') || nameLower.includes('scarves') || nameLower.includes('hat') || nameLower.includes('hats') ||
        nameLower.includes('gloves') || nameLower.includes('jewelry') || nameLower.includes('watch') || nameLower.includes('watches')) {
      return this.personaDatabase.get('clothing-accessories') || null;
    }
    
    // Sunglasses matching
    if (nameLower.includes('sunglasses') || nameLower.includes('sunglass') || nameLower.includes('eyewear') || 
        nameLower.includes('glasses') || nameLower.includes('shades')) {
      return this.personaDatabase.get('sunglasses') || null;
    }
    
    // Shoes matching
    if (nameLower.includes('shoe') || nameLower.includes('shoes') || nameLower.includes('footwear') || 
        nameLower.includes('sneaker') || nameLower.includes('sneakers') || nameLower.includes('boot') || nameLower.includes('boots') ||
        nameLower.includes('sandal') || nameLower.includes('sandals') || nameLower.includes('heel') || nameLower.includes('heels')) {
      return this.personaDatabase.get('shoes') || null;
    }
    
    // Luggage & Bags matching
    if (nameLower.includes('luggage') || nameLower.includes('bag') || nameLower.includes('bags') || 
        nameLower.includes('suitcase') || nameLower.includes('backpack') || nameLower.includes('handbag') || 
        nameLower.includes('purse') || nameLower.includes('tote') || nameLower.includes('briefcase')) {
      return this.personaDatabase.get('luggage-bags') || null;
    }
    
    // Event Tickets matching
    if (nameLower.includes('event') || nameLower.includes('ticket') || nameLower.includes('tickets') || 
        nameLower.includes('concert') || nameLower.includes('show') || nameLower.includes('theater') || 
        nameLower.includes('sports event') || nameLower.includes('entertainment')) {
      return this.personaDatabase.get('event-tickets') || null;
    }
    
    // Media matching
    if (nameLower.includes('media') || nameLower.includes('streaming') || nameLower.includes('video') || 
        nameLower.includes('movie') || nameLower.includes('tv') || nameLower.includes('television') || 
        nameLower.includes('entertainment') || nameLower.includes('content')) {
      return this.personaDatabase.get('media') || null;
    }
    
    // Arts & Entertainment matching
    if (nameLower.includes('arts') || nameLower.includes('entertainment') || nameLower.includes('cultural') || 
        nameLower.includes('museum') || nameLower.includes('gallery') || nameLower.includes('theater') || 
        nameLower.includes('performance') || nameLower.includes('cultural')) {
      return this.personaDatabase.get('arts-entertainment') || null;
    }
    
    // Party & Celebration matching
    if (nameLower.includes('party') || nameLower.includes('celebration') || nameLower.includes('event') || 
        nameLower.includes('birthday') || nameLower.includes('anniversary') || nameLower.includes('wedding') || 
        nameLower.includes('festival') || nameLower.includes('gathering')) {
      return this.personaDatabase.get('party-celebration') || null;
    }
    
    // Baby & Toddler matching
    if (nameLower.includes('baby') || nameLower.includes('toddler') || nameLower.includes('infant') || 
        nameLower.includes('child') || nameLower.includes('children') || nameLower.includes('kids')) {
      return this.personaDatabase.get('baby-toddler') || null;
    }
    
    // Baby & Toddler Clothing matching
    if (nameLower.includes('baby clothing') || nameLower.includes('toddler clothing') || nameLower.includes('baby clothes') || 
        nameLower.includes('toddler clothes') || nameLower.includes('infant clothing') || nameLower.includes('baby apparel') || 
        nameLower.includes('toddler apparel') || nameLower.includes('children clothing')) {
      return this.personaDatabase.get('baby-toddler-clothing') || null;
    }
    
    // Baby Gift Sets matching
    if (nameLower.includes('baby gift') || nameLower.includes('toddler gift') || nameLower.includes('baby set') || 
        nameLower.includes('toddler set') || nameLower.includes('gift set') || nameLower.includes('baby bundle') || 
        nameLower.includes('toddler bundle') || nameLower.includes('baby collection')) {
      return this.personaDatabase.get('baby-gift-sets') || null;
    }
    
    // Baby Health matching
    if (nameLower.includes('baby health') || nameLower.includes('toddler health') || nameLower.includes('infant health') || 
        nameLower.includes('baby wellness') || nameLower.includes('toddler wellness') || nameLower.includes('baby care') || 
        nameLower.includes('toddler care') || nameLower.includes('baby medical')) {
      return this.personaDatabase.get('baby-health') || null;
    }
    
    // Baby Safety matching
    if (nameLower.includes('baby safety') || nameLower.includes('toddler safety') || nameLower.includes('infant safety') || 
        nameLower.includes('baby security') || nameLower.includes('toddler security') || nameLower.includes('baby protection') || 
        nameLower.includes('toddler protection') || nameLower.includes('baby monitor')) {
      return this.personaDatabase.get('baby-safety') || null;
    }
    
    // Baby Toys & Activity Equipment matching
    if (nameLower.includes('baby toys') || nameLower.includes('toddler toys') || nameLower.includes('baby activity') || 
        nameLower.includes('toddler activity') || nameLower.includes('baby equipment') || nameLower.includes('toddler equipment') || 
        nameLower.includes('baby play') || nameLower.includes('toddler play')) {
      return this.personaDatabase.get('baby-toys-activity') || null;
    }
    
    // Baby Transport matching
    if (nameLower.includes('baby transport') || nameLower.includes('toddler transport') || nameLower.includes('stroller') || 
        nameLower.includes('car seat') || nameLower.includes('baby carrier') || nameLower.includes('toddler carrier') || 
        nameLower.includes('baby travel') || nameLower.includes('toddler travel')) {
      return this.personaDatabase.get('baby-transport') || null;
    }
    
    // Diapering matching
    if (nameLower.includes('diaper') || nameLower.includes('diapers') || nameLower.includes('diapering') || 
        nameLower.includes('nappy') || nameLower.includes('nappies') || nameLower.includes('baby hygiene') || 
        nameLower.includes('toddler hygiene') || nameLower.includes('baby care essentials')) {
      return this.personaDatabase.get('diapering') || null;
    }
    
    // Coffee matching
    if (nameLower.includes('coffee') || nameLower.includes('espresso') || nameLower.includes('cappuccino') || 
        nameLower.includes('latte') || nameLower.includes('americano') || nameLower.includes('brew') || 
        nameLower.includes('roast') || nameLower.includes('beans')) {
      return this.personaDatabase.get('coffee') || null;
    }
    
    // Food Items matching
    if (nameLower.includes('food items') || nameLower.includes('food products') || nameLower.includes('grocery') || 
        nameLower.includes('food') || nameLower.includes('ingredients') || nameLower.includes('pantry') || 
        nameLower.includes('foodstuff') || nameLower.includes('foodstuff')) {
      return this.personaDatabase.get('food-items') || null;
    }
    
    // Condiments & Sauces matching
    if (nameLower.includes('condiment') || nameLower.includes('condiments') || nameLower.includes('sauce') || 
        nameLower.includes('sauces') || nameLower.includes('spice') || nameLower.includes('spices') || 
        nameLower.includes('seasoning') || nameLower.includes('seasonings') || nameLower.includes('dressing') || 
        nameLower.includes('dressings') || nameLower.includes('marinade') || nameLower.includes('marinades')) {
      return this.personaDatabase.get('condiments-sauces') || null;
    }
    
    // Cooking & Baking Ingredients matching
    if (nameLower.includes('cooking ingredients') || nameLower.includes('baking ingredients') || nameLower.includes('flour') || 
        nameLower.includes('sugar') || nameLower.includes('salt') || nameLower.includes('oil') || nameLower.includes('oils') || 
        nameLower.includes('vinegar') || nameLower.includes('yeast') || nameLower.includes('baking powder') || 
        nameLower.includes('baking soda') || nameLower.includes('spices') || nameLower.includes('herbs')) {
      return this.personaDatabase.get('cooking-baking-ingredients') || null;
    }
    
    // Dairy Products matching
    if (nameLower.includes('dairy') || nameLower.includes('milk') || nameLower.includes('cheese') || 
        nameLower.includes('yogurt') || nameLower.includes('butter') || nameLower.includes('cream') || 
        nameLower.includes('dairy products') || nameLower.includes('lactose') || nameLower.includes('dairy-free')) {
      return this.personaDatabase.get('dairy-products') || null;
    }
    
    // Beds & Accessories matching
    if (nameLower.includes('bed') || nameLower.includes('beds') || nameLower.includes('mattress') || 
        nameLower.includes('pillow') || nameLower.includes('pillows') || nameLower.includes('bedding') || 
        nameLower.includes('sleep') || nameLower.includes('bedroom') || nameLower.includes('bed frame')) {
      return this.personaDatabase.get('beds-accessories') || null;
    }
    
    // Cookware & Bakeware matching
    if (nameLower.includes('cookware') || nameLower.includes('bakeware') || nameLower.includes('pots') || 
        nameLower.includes('pans') || nameLower.includes('skillet') || nameLower.includes('wok') || 
        nameLower.includes('baking sheet') || nameLower.includes('casserole') || nameLower.includes('roasting pan')) {
      return this.personaDatabase.get('cookware-bakeware') || null;
    }
    
    // Food & Beverage Carriers matching
    if (nameLower.includes('carrier') || nameLower.includes('carriers') || nameLower.includes('bottle') || 
        nameLower.includes('bottles') || nameLower.includes('tumbler') || nameLower.includes('mug') || 
        nameLower.includes('thermos') || nameLower.includes('lunch box') || nameLower.includes('cooler') || 
        nameLower.includes('insulated') || nameLower.includes('travel mug')) {
      return this.personaDatabase.get('food-beverage-carriers') || null;
    }
    
    // Food Storage Accessories matching
    if (nameLower.includes('food storage') || nameLower.includes('storage container') || nameLower.includes('tupperware') || 
        nameLower.includes('container') || nameLower.includes('containers') || nameLower.includes('food prep') || 
        nameLower.includes('meal prep') || nameLower.includes('portion control') || nameLower.includes('food organizer')) {
      return this.personaDatabase.get('food-storage-accessories') || null;
    }
    
    // Lawn & Garden matching
    if (nameLower.includes('lawn') || nameLower.includes('garden') || nameLower.includes('gardening') || 
        nameLower.includes('outdoor') || nameLower.includes('yard') || nameLower.includes('landscaping') || 
        nameLower.includes('plants') || nameLower.includes('seeds') || nameLower.includes('fertilizer') || 
        nameLower.includes('tools') || nameLower.includes('hose') || nameLower.includes('sprinkler')) {
      return this.personaDatabase.get('lawn-garden') || null;
    }
    
    // Computers matching
    if (nameLower.includes('computer') || nameLower.includes('pc') || nameLower.includes('desktop') || 
        nameLower.includes('workstation') || nameLower.includes('server') || nameLower.includes('cpu') || 
        nameLower.includes('processor') || nameLower.includes('ram') || nameLower.includes('memory')) {
      return this.personaDatabase.get('computers') || null;
    }
    
    // Video Game Consoles matching
    if (nameLower.includes('gaming') || nameLower.includes('console') || nameLower.includes('playstation') || 
        nameLower.includes('xbox') || nameLower.includes('nintendo') || nameLower.includes('switch') || 
        nameLower.includes('gaming system') || nameLower.includes('game console') || nameLower.includes('gaming console')) {
      return this.personaDatabase.get('video-game-consoles') || null;
    }
    
    // Software matching
    if (nameLower.includes('software') || nameLower.includes('app') || nameLower.includes('application') || 
        nameLower.includes('program') || nameLower.includes('mobile app') || nameLower.includes('desktop app') || 
        nameLower.includes('software suite') || nameLower.includes('productivity software')) {
      return this.personaDatabase.get('software') || null;
    }
    
    // Computer Software matching
    if (nameLower.includes('computer software') || nameLower.includes('system software') || nameLower.includes('operating system') || 
        nameLower.includes('windows') || nameLower.includes('macos') || nameLower.includes('linux') || 
        nameLower.includes('system utility') || nameLower.includes('system tool')) {
      return this.personaDatabase.get('computer-software') || null;
    }
    
    // Business & Productivity Software matching
    if (nameLower.includes('business software') || nameLower.includes('productivity software') || nameLower.includes('office') || 
        nameLower.includes('microsoft office') || nameLower.includes('google workspace') || nameLower.includes('slack') || 
        nameLower.includes('teams') || nameLower.includes('project management') || nameLower.includes('crm')) {
      return this.personaDatabase.get('business-productivity-software') || null;
    }
    
    // Antivirus & Security Software matching
    if (nameLower.includes('antivirus') || nameLower.includes('security') || nameLower.includes('malware') || 
        nameLower.includes('firewall') || nameLower.includes('vpn') || nameLower.includes('cybersecurity') || 
        nameLower.includes('protection') || nameLower.includes('security software') || nameLower.includes('antimalware')) {
      return this.personaDatabase.get('antivirus-security-software') || null;
    }
    
    // Electronics matching
    if (nameLower.includes('electronics') || nameLower.includes('electronic') || nameLower.includes('device') || 
        nameLower.includes('gadget') || nameLower.includes('tech') || nameLower.includes('technology') || 
        nameLower.includes('smart device') || nameLower.includes('connected device')) {
      return this.personaDatabase.get('electronics') || null;
    }
    
    // Educational Software matching
    if (nameLower.includes('educational software') || nameLower.includes('learning software') || nameLower.includes('e-learning') || 
        nameLower.includes('online course') || nameLower.includes('training software') || nameLower.includes('education') || 
        nameLower.includes('learning platform') || nameLower.includes('educational app')) {
      return this.personaDatabase.get('educational-software') || null;
    }
    
    // Cameras & Optics matching
    if (nameLower.includes('camera') || nameLower.includes('cameras') || nameLower.includes('photography') || 
        nameLower.includes('lens') || nameLower.includes('lenses') || nameLower.includes('optics') || 
        nameLower.includes('dslr') || nameLower.includes('mirrorless') || nameLower.includes('video camera')) {
      return this.personaDatabase.get('cameras-optics') || null;
    }
    
    // Business & Industrial matching
    if (nameLower.includes('business') || nameLower.includes('industrial') || nameLower.includes('commercial') || 
        nameLower.includes('professional') || nameLower.includes('b2b') || nameLower.includes('enterprise') || 
        nameLower.includes('corporate') || nameLower.includes('business equipment') || nameLower.includes('industrial equipment')) {
      return this.personaDatabase.get('business-industrial') || null;
    }
    
    // Office Supplies matching
    if (nameLower.includes('office supplies') || nameLower.includes('office') || nameLower.includes('stationery') || 
        nameLower.includes('desk supplies') || nameLower.includes('office equipment') || nameLower.includes('workplace') || 
        nameLower.includes('office tools') || nameLower.includes('desk accessories') || nameLower.includes('office accessories')) {
      return this.personaDatabase.get('office-supplies') || null;
    }
    
    // Athletics matching
    if (nameLower.includes('athletics') || nameLower.includes('athletic') || nameLower.includes('sports') || 
        nameLower.includes('athletic gear') || nameLower.includes('sports equipment') || nameLower.includes('athletic equipment') || 
        nameLower.includes('performance gear') || nameLower.includes('athletic wear') || nameLower.includes('sports gear')) {
      return this.personaDatabase.get('athletics') || null;
    }
    
    // Exercise & Fitness matching
    if (nameLower.includes('exercise') || nameLower.includes('fitness') || nameLower.includes('workout') || 
        nameLower.includes('gym') || nameLower.includes('training') || nameLower.includes('exercise equipment') || 
        nameLower.includes('fitness equipment') || nameLower.includes('workout gear') || nameLower.includes('exercise gear')) {
      return this.personaDatabase.get('exercise-fitness') || null;
    }
    
    // Yoga & Pilates matching
    if (nameLower.includes('yoga') || nameLower.includes('pilates') || nameLower.includes('yoga mat') || 
        nameLower.includes('yoga gear') || nameLower.includes('pilates equipment') || nameLower.includes('mindfulness') || 
        nameLower.includes('meditation') || nameLower.includes('yoga accessories') || nameLower.includes('pilates gear')) {
      return this.personaDatabase.get('yoga-pilates') || null;
    }
    
    // Indoor Games matching
    if (nameLower.includes('indoor games') || nameLower.includes('board games') || nameLower.includes('table games') || 
        nameLower.includes('card games') || nameLower.includes('puzzle') || nameLower.includes('indoor entertainment') || 
        nameLower.includes('game night') || nameLower.includes('family games') || nameLower.includes('indoor activities')) {
      return this.personaDatabase.get('indoor-games') || null;
    }
    
    // Outdoor Recreation matching
    if (nameLower.includes('outdoor recreation') || nameLower.includes('outdoor') || nameLower.includes('recreation') || 
        nameLower.includes('outdoor activities') || nameLower.includes('outdoor gear') || nameLower.includes('outdoor equipment') || 
        nameLower.includes('adventure') || nameLower.includes('outdoor sports') || nameLower.includes('recreational')) {
      return this.personaDatabase.get('outdoor-recreation') || null;
    }
    
    // Camping & Hiking matching
    if (nameLower.includes('camping') || nameLower.includes('hiking') || nameLower.includes('camping gear') || 
        nameLower.includes('hiking gear') || nameLower.includes('backpacking') || nameLower.includes('outdoor camping') || 
        nameLower.includes('hiking equipment') || nameLower.includes('camping equipment') || nameLower.includes('trail')) {
      return this.personaDatabase.get('camping-hiking') || null;
    }
    
    // Sporting Goods matching
    if (nameLower.includes('sporting goods') || nameLower.includes('sporting') || nameLower.includes('sports goods') || 
        nameLower.includes('sport equipment') || nameLower.includes('competitive sports') || nameLower.includes('sports accessories') || 
        nameLower.includes('sporting equipment') || nameLower.includes('sports gear') || nameLower.includes('athletic goods')) {
      return this.personaDatabase.get('sporting-goods') || null;
    }
    
    // Toys & Games matching
    if (nameLower.includes('toys and games') || nameLower.includes('toys & games') || nameLower.includes('toys and games') || 
        nameLower.includes('educational toys') || nameLower.includes('learning toys') || nameLower.includes('stem toys') || 
        nameLower.includes('building toys') || nameLower.includes('construction toys') || nameLower.includes('educational games')) {
      return this.personaDatabase.get('toys-games') || null;
    }
    
    // Toys matching
    if (nameLower.includes('toys') || nameLower.includes('toy') || nameLower.includes('children toys') || 
        nameLower.includes('kids toys') || nameLower.includes('baby toys') || nameLower.includes('toddler toys') || 
        nameLower.includes('play toys') || nameLower.includes('children play') || nameLower.includes('kids play')) {
      return this.personaDatabase.get('toys') || null;
    }
    
    return null;
  }

  /**
   * Get all available personas
   */
  getAllPersonas(): PersonaInsights[] {
    return Array.from(this.personaDatabase.values());
  }

  /**
   * Get persona by segment ID
   */
  getPersonaBySegmentId(segmentId: string): PersonaInsights | null {
    for (const persona of this.personaDatabase.values()) {
      if (persona.segmentId === segmentId) {
        return persona;
      }
    }
    return null;
  }
}
