"use client"

import { useState } from "react";
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
  const [emailError, setEmailError] =  useState("");
  const [consentError, setConsentError] = useState("");
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Get form data
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;

    // Validate email format
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      setLoading(false);
      return;
    } else {
      setEmailError(""); // Clear error if email is valid
    }

    // Validate consent checkbox
    if (!isConsentChecked) {
      setConsentError("You must agree to the Consent & Acknowledgment.");
      setLoading(false);
      return;
    } else {
      setConsentError(""); // Clear error if consent is checked
    }
    
    // Get form data
    const playerData = {
      username: formData.get('username'),
      name: formData.get('name'),
      email: formData.get('email'),
      isLeftHand: formData.get('handSwing') === 'left'
    };

    try {
      // Push data to Firebase under 'players' node
      const playersRef = ref(db, 'players');
      await push(playersRef, playerData);
      
      // Show success message with template literal
      alert(`Registration successful! Remember your username ${playerData.username} for registration later.`);
      
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[screen] bg-white p-2 sm:p-4 font-[family-name:var(--font-neue)]">
      <Card className="w-full max-w-sm sm:max-w-md mx-auto bg-[#3b6b5d] text-white">
        <CardContent className="pt-4 px-4 sm:px-6 pb-6 space-y-4">
          <form onSubmit={handleSubmit}>
            {/* Logo */}
            <div className="flex justify-center mb-4">
            <Image 
              src="/assets/ecco-golf-logo.png" 
              alt="ECCO Golf" 
              width={150} 
              height={32} 
              className="mb-10 w-60 sm:w-[180px] filter brightness-0 invert" 
            />
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="username" className="text-white">
                </Label>
                <Input 
                  id="username" name="username" required placeholder="Username*"
                  className="bg-transparent border-white/20 text-white placeholder:text-white/50" 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="name" className="text-white">
                </Label>
                <Input 
                  id="name" name="name" placeholder="Name"
                  className="bg-transparent border-white/20 text-white placeholder:text-white/50" 
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-white">
                </Label>
                <Input
                  id="email" name="email" type="email" placeholder="E-mail*"
                  className="bg-transparent border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact" className="text-white">
                </Label>
                <Input
                 id="contact" type="tel" placeholder="Contact Number" className="bg-transparent border-white/20 text-white placeholder:text-white/50"
                />
              </div>

               {/* Hand Swing Preference */}
               <div className="space-y-1">
                <Label className="text-white font-[700] text-sm sm:text-base">
                  What is your preferred hand swing?
                </Label>
                <RadioGroup name="handSwing" defaultValue="left" className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="left" 
                      id="left" 
                      className="h-4 w-4 border-[#f4a460] text-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white" 
                    />
                    <Label htmlFor="left" className="text-white text-xs sm:text-sm">
                      Left
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="right" 
                      id="right" 
                      className="h-4 w-4 border-[#f4a460] text-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white" 
                    />
                    <Label htmlFor="right" className="text-white text-xs sm:text-sm">
                      Right
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* ECCO Products */}
              <div className="space-y-3 mb-8">
                <Label className="text-white font-[700] text-sm sm:text-base">
                  Do you own any ECCO products?
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shoes"
                      className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label htmlFor="shoes" className="text-white ">
                      Yes, I own ECCO shoes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bags"
                      className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label htmlFor="bags" className="text-white ">
                      Yes, I own ECCO bags
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="none"
                      className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label htmlFor="none" className="text-white ">
                      No, I have never tried ECCO products before
                    </Label>
                  </div>
                </div>
              </div>
              

              {/* Consent */}
              <div className="space-y-4 mt-8">
                <p className="text-white font-[700] text-sm sm:text-base">
                  Consent & Acknowledgment
                </p>
                <p className="text-[10px] sm:text-xs text-white/90">
                  By submitting this form, I confirm that I have read and understood the Campaign Terms & Conditions and the
                  Privacy Policy. I consent to the collection and use of my personal data by ECCO China Wholesale Holding(s)
                  PTE LTD for the purpose of participating in the golf game event and receiving event-related
                  communications.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consent"
                    checked={isConsentChecked}
                    onCheckedChange={(checked) => setIsConsentChecked(Boolean(checked))}
                    className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                  />
                  <Label htmlFor="consent" className="text-white font-[700]">
                    I agree to the Consent & Acknowledgment
                  </Label>
                </div>
                {consentError && <p className="text-red-400 text-xs">{consentError}</p>}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <Button 
                type="submit" className="w-28 sm:w-32 bg-[#f4a460] hover:bg-[#f4a460]/90 text-white text-s h-10" disabled={loading}>
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

