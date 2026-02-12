import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; category: string; durationMinutes: number; maxUsers: number }) => Promise<void>;
}

export function CreateRoomModal({ isOpen, onClose, onSubmit }: CreateRoomModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [duration, setDuration] = useState('60');
  const [maxUsers, setMaxUsers] = useState('50');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        title,
        category,
        durationMinutes: parseInt(duration),
        maxUsers: parseInt(maxUsers)
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-md border-border bg-card shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Create Topic Room</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Room Title</label>
              <Input 
                placeholder="e.g. React Developers" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                maxLength={50}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="General">General</option>
                  <option value="Tech">Tech</option>
                  <option value="Music">Music</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Crypto">Crypto</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                  <option value="120">2 Hours</option>
                  <option value="240">4 Hours</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Room'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
