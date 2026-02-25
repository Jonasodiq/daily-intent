import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitCompletion } from '../types';
import { calculateStreak } from './completionService';

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const CACHE_KEY = 'ai_insights_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 timmar

interface InsightData {
  habits: Habit[];
  completions: HabitCompletion[];
  totalHabits: number;
  completedToday: number;
  streaks: { habitName: string; streak: number }[];
  weakestHabit: string;
  strongestHabit: string;
}

interface CachedInsight {
  insight: string;
  timestamp: number;
  dataHash: string;
}

// Skapa en hash av data för att se om något har ändrats
const createDataHash = (data: InsightData): string => {
  return JSON.stringify({
    habitCount: data.totalHabits,
    completedToday: data.completedToday,
    streaks: data.streaks.map(s => s.streak).join(','),
  });
};

// Kolla om vi har en giltig cache
const getCachedInsight = async (dataHash: string): Promise<string | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { insight, timestamp, dataHash: cachedHash }: CachedInsight = JSON.parse(cached);
    
    // Kontrollera om cachen är giltig
    const isExpired = Date.now() - timestamp > CACHE_DURATION;
    const dataChanged = cachedHash !== dataHash;

    if (isExpired || dataChanged) {
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    }

    return insight;
  } catch (error) {
    console.error('⚠️ Fel vid läsning av cache:', error);
    return null;
  }
};

// Spara insikt i cache
const cacheInsight = async (insight: string, dataHash: string): Promise<void> => {
  try {
    const cached: CachedInsight = {
      insight,
      timestamp: Date.now(),
      dataHash,
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    console.log('✅ Insikt cachad');
  } catch (error) {
    console.error('⚠️ Fel vid sparande av cache:', error);
  }
};

// Förbered data för AI:n
export const prepareInsightData = (
  habits: Habit[],
  completions: HabitCompletion[]
): InsightData => {
  const today = new Date().toISOString().split('T')[0];
  const completedToday = completions.filter(c => c.date === today).length;

  const streaks = habits.map(habit => {
    const habitCompletions = completions.filter(c => c.habitId === habit.id);
    return {
      habitName: habit.name,
      streak: calculateStreak(habitCompletions),
    };
  });

  const sortedStreaks = [...streaks].sort((a, b) => b.streak - a.streak);
  const strongestHabit = sortedStreaks[0]?.habitName || 'Ingen';
  const weakestHabit = sortedStreaks[sortedStreaks.length - 1]?.habitName || 'Ingen';

  return {
    habits,
    completions,
    totalHabits: habits.length,
    completedToday,
    streaks,
    weakestHabit,
    strongestHabit,
  };
};

// Generera AI-insikter med Claude
export const generateInsights = async (
  habits: Habit[],
  completions: HabitCompletion[]
): Promise<string> => {
  console.log('🔍 Startar generering av insikter...');
  
  const data = prepareInsightData(habits, completions);
  const dataHash = createDataHash(data);

  console.log('📊 Data:', {
    totalHabits: data.totalHabits,
    completedToday: data.completedToday,
    hasAPIKey: !!ANTHROPIC_API_KEY,
  });

  // Kolla cache först
  const cachedInsight = await getCachedInsight(dataHash);
  if (cachedInsight) {
    console.log('💾 Använder cachad insikt');
    return cachedInsight;
  }

  // Om ingen API-nyckel finns, ge regelbaserade insikter
  if (!ANTHROPIC_API_KEY) {
    console.log('⚠️ Ingen API-nyckel hittades, använder regelbaserade insikter');
    return generateRuleBasedInsights(data);
  }

  try {
    console.log('🤖 Anropar Claude API...');
    
    // Bygg prompt för Claude
    const prompt = buildPrompt(data);
    
    const requestBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 API-svar status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      
      console.error('❌ API-fel:', {
        status: response.status,
        statusText: response.statusText,
        errorMessage,
        errorData,
      });
      
      if (response.status === 401) {
        console.error('🔑 Ogiltig API-nyckel. Kontrollera EXPO_PUBLIC_ANTHROPIC_API_KEY i .env');
      } else if (response.status === 429) {
        console.error('⏱️ Rate limit nådd. Vänta en stund.');
      } else if (response.status === 400) {
        console.error('📝 Felaktig request. Kontrollera prompt-formatet.');
      }
      
      throw new Error(`API-fel: ${response.status} - ${errorMessage}`);
    }

    const result = await response.json();
    console.log('✅ API-svar mottaget');
    
    if (!result.content || !result.content[0] || !result.content[0].text) {
      console.error('❌ Oväntat API-svar format:', result);
      throw new Error('Oväntat svar från API');
    }
    
    const insight = result.content[0].text;
    console.log('💡 Insikt genererad, längd:', insight.length);

    // Spara i cache
    await cacheInsight(insight, dataHash);

    return insight;
  } catch (error: any) {
    console.error('❌ Fel vid AI-generering:', {
      message: error.message,
      name: error.name,
      type: typeof error,
    });
    
    // Fallback till regelbaserade insikter
    console.log('🔄 Fallback: Använder regelbaserade insikter');
    return generateRuleBasedInsights(data);
  }
};

// Bygg prompt för Claude
const buildPrompt = (data: InsightData): string => {
  const streaksText = data.streaks
    .map(s => `- ${s.habitName}: ${s.streak} dagar i rad`)
    .join('\n');

  return `Du är en motiverande coach som hjälper människor med sina vanor. Analysera följande data och ge personliga, uppmuntrande insikter på svenska.

DATA:
- Antal vanor: ${data.totalHabits}
- Genomförda idag: ${data.completedToday} av ${data.totalHabits}
- Starkaste vana: ${data.strongestHabit}
- Svagaste vana: ${data.weakestHabit}

STREAKS:
${streaksText}

Ge 3-4 korta, specifika insikter och tips:
1. Uppmuntran om vad som går bra
2. Konkret tips för förbättring
3. Motiverande uppmaning

Skriv på svenska, var vänlig och personlig. Håll det kort (max 150 ord).`;
};

// Regelbaserade insikter (fallback)
const generateRuleBasedInsights = (data: InsightData): string => {
  console.log('📝 Genererar regelbaserade insikter...');
  
  const { totalHabits, completedToday, streaks, strongestHabit, weakestHabit } = data;

  if (totalHabits === 0) {
    return '🌱 Välkommen! Börja med att skapa din första vana. Välj något enkelt som du kan göra varje dag – små steg leder till stora förändringar!';
  }

  const percentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const bestStreak = Math.max(...streaks.map(s => s.streak), 0);

  let insights = [];

  // Dagens framsteg
  if (percentage === 100) {
    insights.push('🎉 Fantastiskt! Du har genomfört alla vanor idag!');
  } else if (percentage >= 75) {
    insights.push(`✨ Bra jobbat! ${percentage}% genomfört idag.`);
  } else if (percentage >= 50) {
    insights.push(`💪 Du är halvvägs! ${completedToday} av ${totalHabits} vanor genomförda.`);
  } else if (percentage > 0) {
    insights.push(`🌟 Du har startat dagen! ${completedToday} vanor genomförda, fortsätt så!`);
  } else {
    insights.push('⏰ Ingen vana genomförd än idag. Ta första steget nu!');
  }

  // Streak-insikter
  if (bestStreak >= 7) {
    insights.push(`🔥 Imponerande! Din längsta streak är ${bestStreak} dagar för ${strongestHabit}.`);
  } else if (bestStreak >= 3) {
    insights.push(`📈 Din ${strongestHabit}-vana har ${bestStreak} dagars streak. Snart en vecka!`);
  }

  // Tips för förbättring
  const weakStreak = streaks.find(s => s.habitName === weakestHabit);
  if (weakStreak && weakStreak.streak === 0) {
    insights.push(`💡 Tips: Börja med ${weakestHabit} idag för att bygga momentum!`);
  } else if (weakStreak && weakStreak.streak < 3) {
    insights.push(`🎯 ${weakestHabit} behöver lite extra fokus. Små steg varje dag!`);
  }

  // Motiverande avslutning
  if (streaks.length >= 3) {
    insights.push('🌈 Du hanterar flera vanor – det kräver disciplin. Fortsätt så!');
  }

  const result = insights.join('\n\n');
  console.log('✅ Regelbaserade insikter genererade');
  return result;
};

// Rensa cache (användbart för testning)
export const clearInsightsCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Cache rensad');
  } catch (error) {
    console.error('❌ Fel vid rensning av cache:', error);
  }
};
