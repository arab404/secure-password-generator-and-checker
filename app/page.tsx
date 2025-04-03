"use client"

import { useState } from "react"
import { Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"

export default function PasswordGenerator() {
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [length, setLength] = useState(12)
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })
  const [passwordHistory, setPasswordHistory] = useState<string[]>([])
  const [isManualMode, setIsManualMode] = useState(false)
  const [userPassword, setUserPassword] = useState("")

  const generatePassword = () => {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz"
    const numberChars = "0123456789"
    const symbolChars = "!@#$%^&*()_-+=<>?"

    let chars = ""
    let result = ""

    // Add character sets based on selected options
    if (options.uppercase) chars += uppercaseChars
    if (options.lowercase) chars += lowercaseChars
    if (options.numbers) chars += numberChars
    if (options.symbols) chars += symbolChars

    // If no options selected, default to lowercase
    if (chars === "") {
      chars = lowercaseChars
      setOptions((prev) => ({ ...prev, lowercase: true }))
    }

    // Generate random password
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length)
      result += chars[randomIndex]
    }

    // Ensure at least one character from each selected set
    let finalPassword = result
    if (options.uppercase) {
      const randomUppercase = uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]
      finalPassword = replaceCharAt(finalPassword, Math.floor(Math.random() * length), randomUppercase)
    }
    if (options.lowercase) {
      const randomLowercase = lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]
      finalPassword = replaceCharAt(finalPassword, Math.floor(Math.random() * length), randomLowercase)
    }
    if (options.numbers) {
      const randomNumber = numberChars[Math.floor(Math.random() * numberChars.length)]
      finalPassword = replaceCharAt(finalPassword, Math.floor(Math.random() * length), randomNumber)
    }
    if (options.symbols) {
      const randomSymbol = symbolChars[Math.floor(Math.random() * symbolChars.length)]
      finalPassword = replaceCharAt(finalPassword, Math.floor(Math.random() * length), randomSymbol)
    }

    setPassword(finalPassword)
    setPasswordHistory((prev) => [finalPassword, ...prev.slice(0, 9)])
  }

  const replaceCharAt = (str: string, index: number, char: string) => {
    return str.substring(0, index) + char + str.substring(index + 1)
  }

  const copyToClipboard = (textToCopy: string) => {
    if (!textToCopy) return
    navigator.clipboard.writeText(textToCopy)
    toast({
      title: "Copied to clipboard",
      description: "Password has been copied to your clipboard",
      duration: 2000,
    })
  }

  const analyzePassword = (pwd: string) => {
    if (!pwd) return { score: 0, text: "None", color: "bg-gray-200", feedback: [] }

    const feedback: string[] = []
    let score = 0

    // Check length
    if (pwd.length < 8) {
      feedback.push("Password is too short (minimum 8 characters)")
    } else if (pwd.length >= 12) {
      score += 1
    } else if (pwd.length >= 16) {
      score += 2
    }

    // Check character variety
    if (/[A-Z]/.test(pwd)) score += 1
    else feedback.push("Add uppercase letters (A-Z)")
    if (/[a-z]/.test(pwd)) score += 1
    else feedback.push("Add lowercase letters (a-z)")
    if (/[0-9]/.test(pwd)) score += 1
    else feedback.push("Add numbers (0-9)")
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1
    else feedback.push("Add special characters (!@#$%)")

    // Check for common patterns
    if (/^[a-zA-Z]+$/.test(pwd)) {
      feedback.push("Password contains only letters")
    }
    if (/^[0-9]+$/.test(pwd)) {
      feedback.push("Password contains only numbers")
    }
    if (/(.)\1{2,}/.test(pwd)) {
      feedback.push("Password contains repeated characters")
    }
    if (/^(qwerty|asdfgh|zxcvbn|123456|password|admin).*/i.test(pwd)) {
      feedback.push("Password contains common patterns")
      score -= 1
    }

    // Determine strength text and color
    let text = "Very Weak"
    let color = "bg-red-500"

    if (score <= 1) {
      text = "Very Weak"
      color = "bg-red-500"
    } else if (score <= 2) {
      text = "Weak"
      color = "bg-orange-500"
    } else if (score <= 3) {
      text = "Medium"
      color = "bg-yellow-500"
    } else if (score <= 4) {
      text = "Strong"
      color = "bg-green-500"
    } else {
      text = "Very Strong"
      color = "bg-emerald-500"
    }

    return { score, text, color, feedback }
  }

  const getPasswordStrength = () => {
    if (isManualMode) {
      return analyzePassword(userPassword)
    }

    if (!password) return { score: 0, text: "None", color: "bg-gray-200", feedback: [] }

    let score = 0
    if (options.lowercase) score += 1
    if (options.uppercase) score += 1
    if (options.numbers) score += 1
    if (options.symbols) score += 1

    if (length >= 16) score += 1
    else if (length >= 12) score += 0.5

    let text = "Very Weak"
    let color = "bg-red-500"

    if (score <= 1) {
      text = "Very Weak"
      color = "bg-red-500"
    } else if (score <= 2) {
      text = "Weak"
      color = "bg-orange-500"
    } else if (score <= 3) {
      text = "Medium"
      color = "bg-yellow-500"
    } else if (score <= 4) {
      text = "Strong"
      color = "bg-green-500"
    } else {
      text = "Very Strong"
      color = "bg-emerald-500"
    }

    return { score, text, color, feedback: [] }
  }

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [option]: !prev[option] }))
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Password {isManualMode ? "Checker" : "Generator"}</CardTitle>
              <CardDescription>
                {isManualMode
                  ? "Enter your password to check its strength"
                  : "Generate a secure random password based on your preferences"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsManualMode(!isManualMode)
                setUserPassword("")
              }}
            >
              Switch to {isManualMode ? "Generator" : "Checker"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            {isManualMode ? (
              <Input
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Enter your password to check"
                type="text"
                className="pr-10 font-mono"
              />
            ) : (
              <Input
                value={password}
                readOnly
                placeholder="Your password will appear here"
                className="pr-10 font-mono"
              />
            )}
            {(password || userPassword) && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => copyToClipboard(isManualMode ? userPassword : password)}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy password</span>
              </Button>
            )}
          </div>

          {(password || userPassword) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Strength:</span>
                <span>{getPasswordStrength().text}</span>
              </div>
              <div className={`h-2 rounded-full ${getPasswordStrength().color}`} />

              {isManualMode && getPasswordStrength().feedback.length > 0 && (
                <div className="mt-2 text-sm space-y-1">
                  <p className="font-medium">Suggestions to improve:</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {getPasswordStrength().feedback.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!isManualMode && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="length">Length: {length}</Label>
                </div>
                <Slider
                  id="length"
                  min={4}
                  max={32}
                  step={1}
                  value={[length]}
                  onValueChange={(value) => setLength(value[0])}
                />
              </div>

              <div className="space-y-3">
                <Label>Include:</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uppercase"
                      checked={options.uppercase}
                      onCheckedChange={() => handleOptionChange("uppercase")}
                    />
                    <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lowercase"
                      checked={options.lowercase}
                      onCheckedChange={() => handleOptionChange("lowercase")}
                    />
                    <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="numbers"
                      checked={options.numbers}
                      onCheckedChange={() => handleOptionChange("numbers")}
                    />
                    <Label htmlFor="numbers">Numbers (0-9)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="symbols"
                      checked={options.symbols}
                      onCheckedChange={() => handleOptionChange("symbols")}
                    />
                    <Label htmlFor="symbols">Symbols (!@#$%)</Label>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
        {passwordHistory.length > 0 && (
          <div className="border-t px-6 py-4">
            <h3 className="mb-2 font-medium">Password History</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {passwordHistory.map((historyItem, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm font-mono">
                  <span className="truncate">{historyItem}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(historyItem)
                      toast({
                        title: "Copied to clipboard",
                        description: "Password has been copied to your clipboard",
                        duration: 2000,
                      })
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="sr-only">Copy password</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        <CardFooter>
          {isManualMode ? (
            <Button onClick={() => setUserPassword("")} className="w-full" variant="outline">
              Clear Password
            </Button>
          ) : (
            <Button onClick={generatePassword} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Password
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

