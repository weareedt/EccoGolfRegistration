"use client"

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
    username: "",
    name: "",
    email: "",
    contactNumber: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    name: "",
    email: "",
    contactNumber: "",
    consent: "",
    checkbox: "",
  });

  // Real-time field validity states
  const [fieldValidity, setFieldValidity] = useState({
    username: false,
    name: false,
    email: false,
    contactNumber: false,
  });

  const [ownEccoProducts, setOwnEccoProducts] = useState<string[]>([]);
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Update fieldValidity as formValues change
  useEffect(() => {
    setFieldValidity({
      username: formValues.username.trim().length >= 3, // min 3 chars
      name:
        formValues.name.trim().length > 0 &&
        formValues.name.length <= 20, // 1-20 chars
      email: validateEmail(formValues.email.trim()),
      contactNumber: formValues.contactNumber.trim().length >= 8, // min 8 digits
    });
  }, [formValues]);

  const canSubmit =
  fieldValidity.username &&
  fieldValidity.name &&
  fieldValidity.email &&
  fieldValidity.contactNumber;


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (value: string) => {
    setOwnEccoProducts((prev) =>
      value === "No, I have never tried ECCO products before"
        ? [value]
        : prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [
            ...prev.filter(
              (item) => item !== "No, I have never tried ECCO products before"
            ),
            value,
          ]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Clear old errors
    setErrors({
      username: "",
      name: "",
      email: "",
      contactNumber: "",
      consent: "",
      checkbox: "",
    });

    // Basic validations
    let hasError = false;
    const newErrors = { ...errors };

    // Grab data from formValues directly
    const { username, name, email, contactNumber } = formValues;

    // 1. Username
    if (!username.trim()) {
      newErrors.username = "Username is required";
      hasError = true;
    } else if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      hasError = true;
    }

    // 2. Name
    if (!name.trim()) {
      newErrors.name = "Name is required";
      hasError = true;
    } else if (name.length > 20) {
      newErrors.name = "Name cannot exceed 20 characters";
      hasError = true;
    }

    // 3. Email
    if (!email || !validateEmail(email.trim())) {
      newErrors.email = "Please enter a valid email";
      hasError = true;
    }

    // 4. Contact Number
    if (!contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
      hasError = true;
    } else if (contactNumber.trim().length < 8) {
      newErrors.contactNumber = "Contact number must have at least 8 digits";
      hasError = true;
    }

    // 5. ECCO products
    if (ownEccoProducts.length === 0) {
      newErrors.checkbox = "Please select at least one ECCO product";
      hasError = true;
    }

    // 6. Consent
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
      // Check if username already exists in Firebase
      const usernameQuery = query(
        ref(db, "players"),
        orderByChild("username"),
        equalTo(username.trim())
      );
      const snapshot = await get(usernameQuery);
      if (snapshot.exists()) {
        setErrors((prev) => ({
          ...prev,
          username: "Username already exists",
        }));
        setLoading(false);
        return;
      }

      // If all good, push data
      await push(ref(db, "players"), {
        username: username.trim(),
        name: name.trim(),
        email: email.trim(),
        contactNumber: contactNumber.trim(),
        agreeWithConsent: isConsentChecked,
        preferredHandSwing:
          (e.target as HTMLFormElement).handSwing.value === "left"
            ? "Left"
            : "Right",
        ownEccoProducts,
      });

      // Success
      alert(`Registration successful! Remember your username: ${username}`);

      // Reset the form
      (e.target as HTMLFormElement).reset();
      setFormValues({
        username: "",
        name: "",
        email: "",
        contactNumber: "",
      });
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

              {/* Username */}
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    placeholder="Username (min 3 chars)"
                    className="bg-transparent border-white/20 text-white placeholder:text-white/50 pr-8"
                    required
                    value={formValues.username}
                    onChange={handleInputChange}
                  />
                  {/* Check Icon inside same div */}
                  {fieldValidity.username && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <CheckIcon isValid />
                    </div>
                  )}
                </div>
                {errors.username && (
                  <p className="text-red-400 text-xs">{errors.username}</p>
                )}
              </div>

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
                  {/* Check Icon */}
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
                  {/* Check Icon */}
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
                  {/* Check Icon */}
                  {fieldValidity.contactNumber && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <CheckIcon isValid />
                    </div>
                  )}
                </div>
                {errors.contactNumber && (
                  <p className="text-red-400 text-xs">
                    {errors.contactNumber}
                  </p>
                )}
              </div>

              {/* Hand Swing Preference */}
              <div className="space-y-2">
                <Label className="text-white font-[700] text-sm sm:text-base">
                  What is your preferred hand swing?
                </Label>
                <RadioGroup
                  name="handSwing"
                  defaultValue="left"
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="left"
                      id="left"
                      className="h-4 w-4 border-[#f4a460] text-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label
                      htmlFor="left"
                      className="text-white text-xs sm:text-sm"
                    >
                      Left
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="right"
                      id="right"
                      className="h-4 w-4 border-[#f4a460] text-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label
                      htmlFor="right"
                      className="text-white text-xs sm:text-sm"
                    >
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
                      checked={ownEccoProducts.includes(
                        "Yes, I own ECCO shoes"
                      )}
                      onCheckedChange={() =>
                        handleCheckboxChange("Yes, I own ECCO shoes")
                      }
                      className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label htmlFor="shoes" className="text-white">
                      Yes, I own ECCO shoes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bags"
                      name="ownEccoProducts"
                      checked={ownEccoProducts.includes(
                        "Yes, I own ECCO bags"
                      )}
                      onCheckedChange={() =>
                        handleCheckboxChange("Yes, I own ECCO bags")
                      }
                      className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label htmlFor="bags" className="text-white">
                      Yes, I own ECCO bags
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="none"
                      name="noneProducts"
                      checked={ownEccoProducts.includes(
                        "No, I have never tried ECCO products before"
                      )}
                      onCheckedChange={() =>
                        handleCheckboxChange(
                          "No, I have never tried ECCO products before"
                        )
                      }
                      className="border-[#f4a460] data-[state=checked]:bg-[#f4a460] data-[state=checked]:text-white"
                    />
                    <Label htmlFor="none" className="text-white">
                      No, I have never tried ECCO products before
                    </Label>
                  </div>
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
                  By submitting this form, I confirm that I have read and
                  understood the Campaign Terms & Conditions and the Privacy
                  Policy. I consent to the collection and use of my personal data
                  by ECCO China Wholesale Holding(s) PTE LTD for the purpose of
                  participating in the golf game event and receiving
                  event-related communications.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consent"
                    checked={isConsentChecked}
                    onCheckedChange={(checked) =>
                      setIsConsentChecked(Boolean(checked))
                    }
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
              disabled={loading || !canSubmit}    // <-- disable if not valid
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
