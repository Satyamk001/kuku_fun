'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSearch } from '@/components/friends/user-search';
import { RequestList } from '@/components/friends/request-list';
import { FriendList } from '@/components/friends/friend-list';
import { Users, UserPlus, Clock } from 'lucide-react';

export default function FriendsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Friends</h1>
        <p className="text-muted-foreground">Connect with people you know.</p>
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Friends
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
             <Clock className="w-4 h-4" />
             Requests
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
             <UserPlus className="w-4 h-4" />
             Find People
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="friends">
          <Card className="border-border/70 bg-card">
            <CardHeader>
              <CardTitle>Your Friends</CardTitle>
              <CardDescription>People you can chat with.</CardDescription>
            </CardHeader>
            <CardContent>
              <FriendList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="requests">
          <Card className="border-border/70 bg-card">
             <CardHeader>
              <CardTitle>Friend Requests</CardTitle>
              <CardDescription>Manage your incoming and outgoing requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add">
           <Card className="border-border/70 bg-card">
             <CardHeader>
              <CardTitle>Find People</CardTitle>
              <CardDescription>Search for users by name or handle.</CardDescription>
            </CardHeader>
            <CardContent>
              <UserSearch />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
