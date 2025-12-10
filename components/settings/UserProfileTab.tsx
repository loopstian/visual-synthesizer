import * as React from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserProfileTab() {
  return (
    <div className="space-y-6">
      {/* Card 1: Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Manage your account settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Avatar */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/avatars/01.png" alt="@guest" />
              <AvatarFallback>GU</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>

          {/* Row 2: Form */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input id="display-name" defaultValue="Guest User" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                defaultValue="guest@example.com"
                disabled
                readOnly
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default">Save Changes</Button>
        </CardFooter>
      </Card>

      {/* Card 2: Danger Zone */}
      <Card className="border-destructive/50 bg-destructive/10 mt-6">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Permanently remove your Personal Account and all of its contents from
            the Visual Synthesizer platform. This action is not reversible, so
            please continue with caution.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="destructive">Delete Account</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
