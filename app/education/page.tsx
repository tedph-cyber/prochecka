'use client'

import { useState } from 'react'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { BookOpen, Heart, Apple, Activity, AlertCircle, Users, Lightbulb, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const educationTopics = [
  {
    id: 'understanding',
    icon: BookOpen,
    title: 'Understanding Diabetes',
    color: 'blue',
    articles: [
      {
        title: 'What is Diabetes?',
        content: 'Diabetes is a chronic condition that affects how your body processes blood sugar (glucose). There are two main types: Type 1 (body doesn\'t produce insulin) and Type 2 (body doesn\'t use insulin properly).',
        readTime: '5 min'
      },
      {
        title: 'Type 1 vs Type 2 Diabetes',
        content: 'Type 1 diabetes is usually diagnosed in children and young adults, while Type 2 is more common in adults and is often linked to lifestyle factors like obesity and inactivity.',
        readTime: '7 min'
      },
      {
        title: 'Prediabetes: Early Warning Signs',
        content: 'Prediabetes means your blood sugar levels are higher than normal but not high enough to be classified as Type 2 diabetes. It\'s a critical window for prevention.',
        readTime: '6 min'
      }
    ]
  },
  {
    id: 'nutrition',
    icon: Apple,
    title: 'Nutrition & Diet',
    color: 'green',
    articles: [
      {
        title: 'Best Foods for Diabetes',
        content: 'Focus on whole grains, lean proteins, healthy fats, and plenty of vegetables. Foods with a low glycemic index help maintain stable blood sugar levels.',
        readTime: '8 min'
      },
      {
        title: 'Understanding Carbohydrates',
        content: 'Carbs have the biggest impact on blood sugar. Learn to count carbs and choose complex carbs over simple sugars for better glucose control.',
        readTime: '10 min'
      },
      {
        title: 'Meal Planning Tips',
        content: 'The plate method: Fill half your plate with non-starchy vegetables, a quarter with lean protein, and a quarter with whole grains or starchy foods.',
        readTime: '6 min'
      }
    ]
  },
  {
    id: 'exercise',
    icon: Activity,
    title: 'Exercise & Movement',
    color: 'purple',
    articles: [
      {
        title: 'Exercise Benefits for Diabetics',
        content: 'Regular physical activity helps lower blood sugar, improve insulin sensitivity, manage weight, and reduce heart disease risk.',
        readTime: '5 min'
      },
      {
        title: 'Safe Exercise Guidelines',
        content: 'Aim for 150 minutes of moderate aerobic activity per week. Check blood sugar before and after exercise, and stay hydrated.',
        readTime: '7 min'
      },
      {
        title: 'Strength Training Importance',
        content: 'Building muscle mass helps your body use insulin more effectively. Include resistance exercises 2-3 times per week.',
        readTime: '6 min'
      }
    ]
  },
  {
    id: 'complications',
    icon: AlertCircle,
    title: 'Managing Complications',
    color: 'red',
    articles: [
      {
        title: 'Hypoglycemia: Low Blood Sugar',
        content: 'Recognize symptoms (shakiness, sweating, confusion) and treat immediately with 15g of fast-acting carbs. Recheck in 15 minutes.',
        readTime: '8 min'
      },
      {
        title: 'Hyperglycemia: High Blood Sugar',
        content: 'Persistent high blood sugar can lead to DKA. Monitor levels closely and know when to seek medical attention.',
        readTime: '9 min'
      },
      {
        title: 'Long-term Complications',
        content: 'Diabetes can affect eyes, kidneys, nerves, and heart. Regular checkups and good glucose control help prevent these issues.',
        readTime: '10 min'
      }
    ]
  },
  {
    id: 'monitoring',
    icon: Heart,
    title: 'Monitoring & Testing',
    color: 'pink',
    articles: [
      {
        title: 'Blood Glucose Monitoring',
        content: 'Learn when and how to check your blood sugar. Keep a log to identify patterns and adjust your management plan.',
        readTime: '7 min'
      },
      {
        title: 'Understanding A1C Test',
        content: 'The A1C test shows your average blood sugar over the past 2-3 months. Target: below 7% for most adults with diabetes.',
        readTime: '6 min'
      },
      {
        title: 'Continuous Glucose Monitors (CGM)',
        content: 'CGMs provide real-time glucose readings and trends, helping you make informed decisions about food, activity, and medication.',
        readTime: '8 min'
      }
    ]
  },
  {
    id: 'support',
    icon: Users,
    title: 'Support & Community',
    color: 'indigo',
    articles: [
      {
        title: 'Building Your Support Team',
        content: 'Work with endocrinologists, diabetes educators, dietitians, and mental health professionals for comprehensive care.',
        readTime: '5 min'
      },
      {
        title: 'Mental Health & Diabetes',
        content: 'Managing diabetes can be stressful. It\'s normal to feel overwhelmed. Seek support when needed.',
        readTime: '7 min'
      },
      {
        title: 'Connecting with Others',
        content: 'Join diabetes support groups (online or in-person) to share experiences, tips, and encouragement.',
        readTime: '4 min'
      }
    ]
  }
]

export default function EducationPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/sign-in')
  }

  const selectedTopicData = educationTopics.find(t => t.id === selectedTopic)

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        isGuest={!user}
        messagesLength={0}
        onSignOut={handleSignOut}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedTopic ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Diabetes Education Center</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Empower yourself with knowledge about diabetes prevention, management, and living a healthy life.
              </p>
            </div>

            {/* Topics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {educationTopics.map((topic) => {
                const Icon = topic.icon
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`bg-card border-2 border-${topic.color}-200 hover:border-${topic.color}-400 rounded-xl p-6 text-left transition-all hover:shadow-lg group`}
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-${topic.color}-100 rounded-lg mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 text-${topic.color}-600`} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{topic.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {topic.articles.length} articles
                    </p>
                    <div className="flex items-center text-primary font-medium text-sm">
                      Learn more <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Call to Action */}
            <div className="mt-12 bg-linear-to-r from-primary/10 to-blue-500/10 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Take Control?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Start your PIMA diabetes risk assessment today and get a personalized health plan.
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                Start Assessment
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Topic Detail View */}
            <Button
              onClick={() => setSelectedTopic(null)}
              variant="ghost"
              className="mb-6"
            >
              ← Back to Topics
            </Button>

            {selectedTopicData && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  {(() => {
                    const Icon = selectedTopicData.icon
                    return <div className={`inline-flex items-center justify-center w-16 h-16 bg-${selectedTopicData.color}-100 rounded-xl`}>
                      <Icon className={`w-8 h-8 text-${selectedTopicData.color}-600`} />
                    </div>
                  })()}
                  <div>
                    <h1 className="text-3xl font-bold">{selectedTopicData.title}</h1>
                    <p className="text-muted-foreground">{selectedTopicData.articles.length} informative articles</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  {selectedTopicData.articles.map((article, index) => (
                    <div key={index} className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold">{article.title}</h3>
                        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          {article.readTime}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {article.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
