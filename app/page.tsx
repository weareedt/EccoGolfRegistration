"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image"
import { db } from "@/lib/firebase"
import { ref, push } from "firebase/database"

export default function RegistrationForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target as HTMLFormElement);
    const playerData = {
      player: formData.get('username'),
      name: formData.get('name'),
      email: formData.get('email'),
      isLeftHand: formData.get('handSwing') === 'left'
    };

    try {
      // Push data to Firebase under 'players' node
      const playersRef = ref(db, 'players');
      await push(playersRef, playerData);
      
      // Show success message with template literal
      alert(`Registration successful! Remember your username ${playerData.player} for registration later.`);
      
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 font-[family-name:var(--font-neue)]">
      <Card className="w-full max-w-md mx-auto bg-[#3b6b5d] text-white">
        <CardContent className="pt-6 px-6 pb-8 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image src="/assets/ecco-golf-logo.png" alt="ECCO Golf" width={180} height={38} className="mb-2" />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input 
                  id="username" 
                  name="username"
                  className="bg-transparent border-white/20 text-white placeholder:text-white/50" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Name
                </Label>
                <Input 
                  id="name" 
                  name="name"
                  className="bg-transparent border-white/20 text-white placeholder:text-white/50" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  E-mail
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="bg-transparent border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact" className="text-white">
                  Contact Number
                </Label>
                <Input
                  id="contact"
                  type="tel"
                  className="bg-transparent border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              {/* Hand Swing Preference */}
              <div className="space-y-2">
                <Label className="text-white">What is your preferred hand swing?</Label>
                <RadioGroup name="handSwing" defaultValue="right" className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="left" 
                      id="left" 
                      className="border-[#f4a460] text-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white" 
                    />
                    <Label htmlFor="left" className="text-white">
                      Left
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="right" 
                      id="right" 
                      className="border-[#f4a460] text-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white" 
                    />
                    <Label htmlFor="right" className="text-white">
                      Right
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* ECCO Products */}
              <div className="space-y-3">
                <Label className="text-white">Do you own any ECCO products? :</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shoes"
                      className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label htmlFor="shoes" className="text-white">
                      Yes, I own ECCO shoes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bags"
                      className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label htmlFor="bags" className="text-white">
                      Yes, I own ECCO bags
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="none"
                      className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label htmlFor="none" className="text-white">
                      No, I have never tried ECCO products before
                    </Label>
                  </div>
                </div>
              </div>

              {/* Consent */}
              <div className="space-y-4">
                <p className="text-sm text-white/90">
                  By submitting this form, I confirm that I have read and understood the Campaign Terms & Conditions and the
                  Privacy Policy. I consent to the collection and use of my personal data by ECCO China Wholesale Holding(s)
                  PTE LTD for the purpose of participating in the golf game event and receiving event-related
                  communications.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consent"
                    className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                  />
                  <Label htmlFor="consent" className="text-white">
                    I agree to the Consent & Acknowledgment
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button className="w-32 bg-[#f4a460] hover:bg-[#f4a460]/90 text-white">
                  SUBMIT
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

