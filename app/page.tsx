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
import { ref, push, query, get, orderByChild, equalTo } from "firebase/database";

export default function RegistrationForm() { // State to store players data  
  const [emailError, setEmailError] =  useState("");
  const [consentError, setConsentError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ownEccoProducts, setOwnEccoProducts] = useState<string[]>([]);
  
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handle ECCO Product Selection
  const handleCheckboxChange = (value: string) => {
    setOwnEccoProducts(prev => value === "No, I have never tried ECCO products before" 
      ? [value] 
      : prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev.filter(item => item !== "No, I have never tried ECCO products before"), value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUsernameError("");

    // **Get form data
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;

    // **Validate email format
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return setLoading(false);
    }
    setEmailError("");

    // **Validate required fields
    if (!username) {
      setUsernameError("Username is required");
      return setLoading(false);
    }

    // **Validate consent checkbox
    if (!isConsentChecked) {
      setConsentError("You must agree to the Consent & Acknowledgment.");
      return setLoading(false);
    }
    setConsentError("");

    try {
      // **Check if username exists
    const usernameQuery = query(
      ref(db, "players"),
      orderByChild("username"),
      equalTo(username)
    );
    const snapshot = await get(usernameQuery);

    if (snapshot.exists()) {
      setUsernameError("Username already exists. Please choose a different one.");
      return setLoading(false);
    }

    // **Collect form data
    const playerData = {
      username: username,
      name: formData.get('name')as string,
      email: email,
      contactNumber: formData.get('contactNumber') as string,
      agreeWithConsent: isConsentChecked,
      preferredHandSwing: formData.get('handSwing') === 'left' ? 'Left' : 'Right',
      ownEccoProducts: ownEccoProducts.length > 0 ? ownEccoProducts : [], // Store empty array if nothing is selected
    };

    const playersRef = ref(db, "players");
    await push(playersRef, playerData);

      
    // **Show success message with template literal
    alert(`Registration successful! Remember your username ${playerData.username} for registration later.`);

    // **Reset form
    (e.target as HTMLFormElement).reset();
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('Error submitting form. Please try again.');
  }

    setLoading(false);
  };

  return (
    <div className="min-h-[screen] bg-white p-2 sm:p-4 font-[family-name:var(--font-neue)]">
      <Card className="w-full max-w-sm sm:max-w-md mx-auto bg-[#3B6C66] text-white">
        <CardContent className="pt-4 px-4 sm:px-6 pb-6 space-y-4">
          <form onSubmit={handleSubmit}>
            {/* Logo */}
            <div className="flex justify-center
            ">
            <Image 
              src="/assets/ecco-golf-logo.png" 
              alt="ECCO Golf" 
              width={150} 
              height={30} 
              className="w-40 sm:w-[180px] filter brightness-0 invert" 
            />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-4">
                <Label htmlFor="username" className="text-white">
                </Label>
                <Input 
                  id="username" name="username" required placeholder="Username"
                  className="bg-transparent border-white/20 text-white placeholder:text-white/50" 
                />
                {usernameError && <p className="text-red-400 text-xs">{usernameError}</p>}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                </Label>
                <Input 
                  id="name" name="name" placeholder="Name"
                  className="bg-transparent border-white/20 text-white placeholder:text-white/50" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                </Label>
                <Input
                  id="email" name="email" type="email" placeholder="E-mail"
                  className="bg-transparent border-white/20 text-white placeholder:text-white/50"
                />
                {emailError && <p className="text-red-400 text-xs">{emailError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact" className="text-white">
                </Label>
                <Input
                 id="contact" type="tel" placeholder="Contact Number" className="bg-transparent border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              </div>

               {/* Hand Swing Preference */}
               <div className="space-y-2">
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
              <div className="space-y-2">
                <Label className="text-white font-[700] text-sm sm:text-base">
                  Do you own any ECCO products?
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shoes"
                      name="ownEccoProducts"
                      checked={ownEccoProducts.includes("Yes, I own ECCO shoes")}
                      onCheckedChange={() => handleCheckboxChange("Yes, I own ECCO shoes")}
                      className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label htmlFor="shoes" className="text-white ">
                      Yes, I own ECCO shoes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bags"
                      name="ownEccoProducts"
                      checked={ownEccoProducts.includes("Yes, I own ECCO bags")}
                      onCheckedChange={() => handleCheckboxChange("Yes, I own ECCO bags")}
                      className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label htmlFor="bags" className="text-white ">
                      Yes, I own ECCO bags
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="none"
                      name="noneProducts"
                      checked={ownEccoProducts.includes("No, I have never tried ECCO products before")}
                      onCheckedChange={() => handleCheckboxChange("No, I have never tried ECCO products before")}
                      className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label htmlFor="none" className="text-white ">
                      No, I have never tried ECCO products before
                    </Label>
                  </div>
                </div>
              </div>

              {/* Consent */}
              <div className="space-y-2">
                <p className="text-white font-[700] text-sm sm:text-base text-center">
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

