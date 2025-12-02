'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  User, Heart, Activity, Phone, Shield, Building2, 
  Save, ArrowLeft, Calendar, Droplet, Ruler, Weight,
  AlertCircle, UserPlus, MapPin, FileText
} from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    // Personal Info
    full_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    
    // Medical Info
    blood_type: '',
    height_cm: '',
    weight_kg: '',
    diabetes_type: '',
    diagnosis_date: '',
    current_medications: [] as string[],
    allergies: [] as string[],
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    
    // Insurance
    insurance_provider: '',
    insurance_policy_number: '',
    primary_doctor_name: '',
    primary_doctor_phone: '',
    preferred_hospital: '',
    
    // Next of Kin
    next_of_kin_name: '',
    next_of_kin_phone: '',
    next_of_kin_relationship: '',
    next_of_kin_address: '',
  })
  
  const [newMedication, setNewMedication] = useState('')
  const [newAllergy, setNewAllergy] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/sign-in')
        return
      }
      
      setUser(user)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single() as { data: any; error: any }
      
      if (error) throw error
      
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          phone_number: data.phone_number || '',
          blood_type: data.blood_type || '',
          height_cm: data.height_cm || '',
          weight_kg: data.weight_kg || '',
          diabetes_type: data.diabetes_type || '',
          diagnosis_date: data.diagnosis_date || '',
          current_medications: data.current_medications || [],
          allergies: data.allergies || [],
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          emergency_contact_relationship: data.emergency_contact_relationship || '',
          insurance_provider: data.insurance_provider || '',
          insurance_policy_number: data.insurance_policy_number || '',
          primary_doctor_name: data.primary_doctor_name || '',
          primary_doctor_phone: data.primary_doctor_phone || '',
          preferred_hospital: data.preferred_hospital || '',
          next_of_kin_name: data.next_of_kin_name || '',
          next_of_kin_phone: data.next_of_kin_phone || '',
          next_of_kin_relationship: data.next_of_kin_relationship || '',
          next_of_kin_address: data.next_of_kin_address || '',
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const result = await supabase
        .from('user_profiles')
        // @ts-ignore - Supabase types issue with extended profile fields
        .update(profile)
        .eq('id', user.id)
      
      if (result.error) throw result.error
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const addMedication = () => {
    if (newMedication.trim()) {
      setProfile(prev => ({
        ...prev,
        current_medications: [...prev.current_medications, newMedication.trim()]
      }))
      setNewMedication('')
    }
  }

  const removeMedication = (index: number) => {
    setProfile(prev => ({
      ...prev,
      current_medications: prev.current_medications.filter((_, i) => i !== index)
    }))
  }

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setProfile(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }))
      setNewAllergy('')
    }
  }

  const removeAllergy = (index: number) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const calculateBMI = () => {
    const height = parseFloat(profile.height_cm)
    const weight = parseFloat(profile.weight_kg)
    if (height && weight && height > 0) {
      const bmi = weight / ((height / 100) ** 2)
      return bmi.toFixed(1)
    }
    return null
  }

  const bmi = calculateBMI()

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        isGuest={false}
        messagesLength={0}
        onSignOut={() => router.push('/auth/sign-in')}
        onResetChat={() => {}}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">Manage your health information securely</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={profile.date_of_birth}
                  onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone_number}
                  onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold">Medical Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Blood Type</label>
                <select
                  value={profile.blood_type}
                  onChange={(e) => setProfile({ ...profile, blood_type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Ruler className="w-4 h-4 inline mr-1" />
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={profile.height_cm}
                  onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="170"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Weight className="w-4 h-4 inline mr-1" />
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={profile.weight_kg}
                  onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="70"
                />
              </div>
              
              {bmi && (
                <div>
                  <label className="block text-sm font-medium mb-2">BMI (Calculated)</label>
                  <div className="px-4 py-2 rounded-lg border border-border bg-muted">
                    <span className="text-lg font-semibold">{bmi}</span>
                    <span className="text-sm ml-2">
                      {parseFloat(bmi) < 18.5 && '(Underweight)'}
                      {parseFloat(bmi) >= 18.5 && parseFloat(bmi) < 25 && '(Normal)'}
                      {parseFloat(bmi) >= 25 && parseFloat(bmi) < 30 && '(Overweight)'}
                      {parseFloat(bmi) >= 30 && '(Obese)'}
                    </span>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Diabetes Type</label>
                <select
                  value={profile.diabetes_type}
                  onChange={(e) => setProfile({ ...profile, diabetes_type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="type1">Type 1</option>
                  <option value="type2">Type 2</option>
                  <option value="prediabetes">Prediabetes</option>
                  <option value="gestational">Gestational</option>
                  <option value="none">Not Diabetic</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Diagnosis Date</label>
                <input
                  type="date"
                  value={profile.diagnosis_date}
                  onChange={(e) => setProfile({ ...profile, diagnosis_date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Medications */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Current Medications</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add medication (e.g., Metformin 500mg)"
                />
                <Button onClick={addMedication} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.current_medications.map((med, index) => (
                  <div
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {med}
                    <button
                      onClick={() => removeMedication(index)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                <AlertCircle className="w-4 h-4 inline mr-1 text-orange-500" />
                Allergies
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add allergy (e.g., Penicillin)"
                />
                <Button onClick={addAllergy} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((allergy, index) => (
                  <div
                    key={index}
                    className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {allergy}
                    <button
                      onClick={() => removeAllergy(index)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold">Emergency Contact</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={profile.emergency_contact_name}
                  onChange={(e) => setProfile({ ...profile, emergency_contact_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Emergency contact name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={profile.emergency_contact_phone}
                  onChange={(e) => setProfile({ ...profile, emergency_contact_phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Relationship</label>
                <input
                  type="text"
                  value={profile.emergency_contact_relationship}
                  onChange={(e) => setProfile({ ...profile, emergency_contact_relationship: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Spouse, Parent, etc."
                />
              </div>
            </div>
          </div>

          {/* Insurance & Healthcare */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Insurance & Healthcare Provider</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Insurance Provider</label>
                <input
                  type="text"
                  value={profile.insurance_provider}
                  onChange={(e) => setProfile({ ...profile, insurance_provider: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="NHIS, HMO, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Policy Number</label>
                <input
                  type="text"
                  value={profile.insurance_policy_number}
                  onChange={(e) => setProfile({ ...profile, insurance_policy_number: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Policy/ID number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Primary Doctor</label>
                <input
                  type="text"
                  value={profile.primary_doctor_name}
                  onChange={(e) => setProfile({ ...profile, primary_doctor_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Dr. Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Doctor's Phone</label>
                <input
                  type="tel"
                  value={profile.primary_doctor_phone}
                  onChange={(e) => setProfile({ ...profile, primary_doctor_phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Preferred Hospital
                </label>
                <input
                  type="text"
                  value={profile.preferred_hospital}
                  onChange={(e) => setProfile({ ...profile, preferred_hospital: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Hospital name and location"
                />
              </div>
            </div>
          </div>

          {/* Next of Kin */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <UserPlus className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-semibold">Next of Kin</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={profile.next_of_kin_name}
                  onChange={(e) => setProfile({ ...profile, next_of_kin_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Next of kin name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={profile.next_of_kin_phone}
                  onChange={(e) => setProfile({ ...profile, next_of_kin_phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Relationship</label>
                <input
                  type="text"
                  value={profile.next_of_kin_relationship}
                  onChange={(e) => setProfile({ ...profile, next_of_kin_relationship: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Spouse, Child, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Address
                </label>
                <input
                  type="text"
                  value={profile.next_of_kin_address}
                  onChange={(e) => setProfile({ ...profile, next_of_kin_address: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Full address"
                />
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">🔒 Your Data is Secure</p>
                <p>All medical information is encrypted and HIPAA-compliant. Only you can access your health data.</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
