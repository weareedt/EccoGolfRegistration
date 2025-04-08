"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon } from "@/components/ui/check-icon";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { ref, push, query, get, orderByChild, equalTo } from "firebase/database";

export default function RegistrationForm() {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    contactNumber: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    contactNumber: "",
    consent: "",
    checkbox: "",
  });

  const [fieldValidity, setFieldValidity] = useState({
    name: false,
    email: false,
    contactNumber: false,
  });

  const [ownEccoProducts, setOwnEccoProducts] = useState<string[]>([]);
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Update fieldValidity as formValues change
  useEffect(() => {
    setFieldValidity({
      name: formValues.name.trim().length > 0 && formValues.name.length <= 20, // 1-20 chars
      email: validateEmail(formValues.email.trim()),
      contactNumber: formValues.contactNumber.trim().length >= 8, // min 8 digits
    });
  }, [formValues]);

  // Determine if form can be submitted
  const canSubmit =
    fieldValidity.name &&
    fieldValidity.email &&
    fieldValidity.contactNumber;
    
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle ECCO Products checkbox logic
  const handleCheckboxChange = (value: string) => {
    setOwnEccoProducts((prev) =>
      value === "None"
        ? [value] // If "None" is checked, clear other selections
        : prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev.filter((item) => item !== "None"), value]
    );
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Clear old errors
    setErrors({
      name: "",
      email: "",
      contactNumber: "",
      consent: "",
      checkbox: "",
    });

    let hasError = false;
    const newErrors = { ...errors };
    const { name, email, contactNumber } = formValues;

    // Check if name already exists in database
    try {
      const playersRef = ref(db, "players");
      const nameQuery = query(playersRef, orderByChild("name"), equalTo(name.trim()));
      const snapshot = await get(nameQuery);
      
      if (snapshot.exists()) {
        newErrors.name = "This name is already registered";
        hasError = true;
        setErrors(newErrors);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error checking name:", error);
      alert("Error checking name availability. Please try again.");
      setLoading(false);
      return;
    }

    // 1. Name
    if (!name.trim()) {
      newErrors.name = "Name is required";
      hasError = true;
    } else if (name.length > 20) {
      newErrors.name = "Name cannot exceed 20 characters";
      hasError = true;
    }

    // 2. Email
    if (!email || !validateEmail(email.trim())) {
      newErrors.email = "Please enter a valid email";
      hasError = true;
    }

    // 3. Contact Number
    if (!contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
      hasError = true;
    } else if (contactNumber.trim().length < 8) {
      newErrors.contactNumber = "Contact number must have at least 8 digits";
      hasError = true;
    }

    // 4. ECCO products
    if (ownEccoProducts.length === 0) {
      newErrors.checkbox = "Please select at least one ECCO product";
      hasError = true;
    }

    // 5. Consent
    if (!isConsentChecked) {
      newErrors.consent = "You must agree to the Consent & Acknowledgment";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await push(ref(db, "players"), {
        name: name.trim(),
        email: email.trim(),
        contactNumber: contactNumber.trim(),
        agreeWithConsent: isConsentChecked,
        ownEccoProducts,
        scores:[],
      });
      
      alert(`Registration successful!`);

      // Reset the form
      (e.target as HTMLFormElement).reset();
      setFormValues({ name: "", email: "", contactNumber: "" });
      setOwnEccoProducts([]);
      setIsConsentChecked(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 font-[family-name:var(--font-neue)]">
      <Card className="w-full max-w-sm sm:max-w-md mx-auto bg-[#3B6C66] text-white">
        <CardContent className="pt-4 px-4 sm:px-6 pb-6 space-y-4">
          <form onSubmit={handleSubmit}>
            {/* Logo */}
            <div className="flex justify-center">
              <Image
                src="/assets/ecco-golf-logo.png"
                alt="ECCO Golf"
                width={150}
                height={30}
                className="w-40 sm:w-[180px] filter brightness-0 invert"
              />
            </div>

            {/* -- FIELDS -- */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    placeholder="Name (max 20 chars)"
                    className="bg-transparent border-white/20 text-white placeholder:text-white/50 pr-8"
                    required
                    value={formValues.name}
                    onChange={handleInputChange}
                  />
                  {fieldValidity.name && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <CheckIcon isValid />
                    </div>
                  )}
                </div>
                {errors.name && (
                  <p className="text-red-400 text-xs">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    placeholder="Email address"
                    className="bg-transparent border-white/20 text-white placeholder:text-white/50 pr-8"
                    required
                    value={formValues.email}
                    onChange={handleInputChange}
                  />
                  {fieldValidity.email && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <CheckIcon isValid />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs">{errors.email}</p>
                )}
              </div>

              {/* Contact Number */}
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    placeholder="Contact Number (min 8 digits)"
                    className="bg-transparent border-white/20 text-white placeholder:text-white/50 pr-8"
                    required
                    value={formValues.contactNumber}
                    onChange={handleInputChange}
                  />
                  {fieldValidity.contactNumber && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <CheckIcon isValid />
                    </div>
                  )}
                </div>
                {errors.contactNumber && (
                  <p className="text-red-400 text-xs">{errors.contactNumber}</p>
                )}
              </div>

              {/* ECCO Products */}
              <div className="space-y-2">
                <Label className="text-white font-[700] text-sm sm:text-base">
                  Which ECCO products do you own?
                </Label>
                <div className="space-y-2">
                  {["Golf Shoe", "Non-Golf Shoe", "Bag", "None"].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={item}
                        checked={ownEccoProducts.includes(item)}
                        onCheckedChange={() => handleCheckboxChange(item)}
                        className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                      />
                      <Label htmlFor={item} className="text-white">
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.checkbox && (
                  <p className="text-red-400 text-xs">{errors.checkbox}</p>
                )}
              </div>

              {/* Consent */}
              <div className="space-y-2">
                <p className="text-white font-[700] text-sm sm:text-base text-center">
                  Consent & Acknowledgment
                </p>
                <p className="text-[10px] sm:text-xs text-white/90">
                  By submitting this form, I confirm that I have read and understood
                  the Campaign Terms & Conditions and the Privacy Policy. I consent
                  to the collection and use of my personal data by ECCO China Wholesale
                  Holding(s) PTE LTD for the purpose of participating in the golf game
                  event and receiving event-related communications.
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
                {errors.consent && (
                  <p className="text-red-400 text-xs">{errors.consent}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <Button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="w-28 sm:w-32 bg-[#f4a460] hover:bg-[#f4a460]/90 text-white h-10"
                >
                  {loading ? "Submitting..." : "SUBMIT"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
