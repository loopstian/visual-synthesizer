"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function ModelConfigTab() {
  const [selectedProvider, setSelectedProvider] = React.useState("bedrock")
  const [authMethod, setAuthMethod] = React.useState("iam")

  const getModelOptions = (provider: string) => {
    switch (provider) {
      case "bedrock":
        return [
          { value: "amazon.nova-lite-v1:0", label: "Amazon Nova Lite" },
          { value: "anthropic.claude-3-5-sonnet-20240620-v1:0", label: "Claude 3.5 Sonnet" },
          { value: "meta.llama3-70b-instruct-v1:0", label: "Llama 3 70B" },
        ]
      case "openai":
        return [
          { value: "gpt-4o", label: "GPT-4o" },
          { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
        ]
      case "anthropic":
        return [
          { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
        ]
      case "meta":
        return [
            { value: "llama-3-70b", label: "Llama 3 70B" }
        ]
      default:
        return []
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Model Configuration</CardTitle>
        <CardDescription>
          Configure the AI models and providers used for generation and analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="provider">AI Provider</Label>
          <Select
            value={selectedProvider}
            onValueChange={setSelectedProvider}
          >
            <SelectTrigger id="provider">
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Amazon Web Services</SelectLabel>
                <SelectItem value="bedrock">Amazon Bedrock</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>3rd Party Providers</SelectLabel>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="meta">Meta / Llama</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Target Model</Label>
          <Select defaultValue={getModelOptions(selectedProvider)[0]?.value}>
            <SelectTrigger id="model">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {getModelOptions(selectedProvider).map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <Label className="text-base">Authentication</Label>
          
          {selectedProvider === "bedrock" ? (
            <div className="space-y-4">
              <RadioGroup
                defaultValue="iam"
                value={authMethod}
                onValueChange={setAuthMethod}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="iam" id="iam" />
                  <Label htmlFor="iam" className="font-normal">AWS Credentials (IAM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="api-key" id="api-key" />
                  <Label htmlFor="api-key" className="font-normal">API Key (Preview)</Label>
                </div>
              </RadioGroup>

              {authMethod === "iam" ? (
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aws-access-key">AWS Access Key ID</Label>
                    <Input id="aws-access-key" type="password" placeholder="AKIA..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aws-secret-key">AWS Secret Access Key</Label>
                    <Input id="aws-secret-key" type="password" placeholder="wJalr..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aws-region">AWS Region</Label>
                    <Input id="aws-region" placeholder="us-east-1" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="bedrock-api-key">Bedrock API Key</Label>
                  <Input id="bedrock-api-key" type="password" placeholder="bedrock-..." />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input id="api-key" type="password" placeholder="sk-..." />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full sm:w-auto">Save Configuration</Button>
      </CardFooter>
    </Card>
  )
}
