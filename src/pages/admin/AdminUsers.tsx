import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Eye, UserX, CheckCircle, XCircle, Users, UserCheck, ShieldCheck, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'farmer' | 'buyer' | 'admin';
  isActive: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
  farmName?: string;
  createdAt: string;
  lastLogin: string;
}

const mockUsers: User[] = [
  { id: '1', firstName: 'John', lastName: 'Farmer', email: 'john@farm.com', phone: '+1234567890', role: 'farmer', isActive: true, kycStatus: 'verified', farmName: 'Green Valley Farm', createdAt: '2024-01-15', lastLogin: '2024-01-20' },
  { id: '2', firstName: 'Jane', lastName: 'Buyer', email: 'jane@email.com', phone: '+0987654321', role: 'buyer', isActive: true, kycStatus: 'verified', createdAt: '2024-01-10', lastLogin: '2024-01-19' },
  { id: '3', firstName: 'Bob', lastName: 'Smith', email: 'bob@farm.com', phone: '+1122334455', role: 'farmer', isActive: true, kycStatus: 'pending', farmName: 'Sunrise Organics', createdAt: '2024-01-18', lastLogin: '2024-01-20' },
  { id: '4', firstName: 'Alice', lastName: 'Johnson', email: 'alice@email.com', phone: '+5566778899', role: 'buyer', isActive: false, kycStatus: 'rejected', createdAt: '2024-01-05', lastLogin: '2024-01-10' },
  { id: '5', firstName: 'Admin', lastName: 'User', email: 'admin@agri.com', phone: '+1231231234', role: 'admin', isActive: true, kycStatus: 'verified', createdAt: '2024-01-01', lastLogin: '2024-01-20' },
  { id: '6', firstName: 'Mike', lastName: 'Wilson', email: 'mike@farm.com', phone: '+9998887776', role: 'farmer', isActive: true, kycStatus: 'pending', farmName: 'Happy Harvest', createdAt: '2024-01-19', lastLogin: '2024-01-20' },
];

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) || 
      (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    farmers: users.filter(u => u.role === 'farmer').length,
    buyers: users.filter(u => u.role === 'buyer').length,
    pendingKyc: users.filter(u => u.kycStatus === 'pending').length,
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleDeactivateClick = (user: User) => {
    setSelectedUser(user);
    setIsDeactivateDialogOpen(true);
  };

  const handleDeactivateConfirm = () => {
    if (selectedUser) {
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, isActive: !u.isActive } : u
      ));
      toast({
        title: selectedUser.isActive ? 'User Deactivated' : 'User Activated',
        description: `${selectedUser.firstName} ${selectedUser.lastName} has been ${selectedUser.isActive ? 'deactivated' : 'activated'}.`,
      });
      setIsDeactivateDialogOpen(false);
    }
  };

  const handleKycAction = (userId: string, action: 'verify' | 'reject') => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, kycStatus: action === 'verify' ? 'verified' : 'rejected' } : u
    ));
    toast({
      title: action === 'verify' ? 'KYC Verified' : 'KYC Rejected',
      description: `User KYC has been ${action === 'verify' ? 'verified' : 'rejected'}.`,
    });
  };

  const getKycBadge = (status: User['kycStatus']) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
    }
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>;
      case 'farmer':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Farmer</Badge>;
      case 'buyer':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Buyer</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage users, verify KYC, and control access</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.farmers}</p>
                <p className="text-sm text-muted-foreground">Farmers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.buyers}</p>
                <p className="text-sm text-muted-foreground">Buyers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingKyc}</p>
                <p className="text-sm text-muted-foreground">Pending KYC</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
            <TabsTrigger value="pending-kyc">Pending KYC ({stats.pendingKyc})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getKycBadge(user.kycStatus)}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeactivateClick(user)}
                              className={user.isActive ? 'text-destructive hover:text-destructive' : 'text-green-600 hover:text-green-600'}
                            >
                              {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending-kyc">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Farm Name</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(u => u.kycStatus === 'pending').map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{user.farmName || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{user.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleKycAction(user.id, 'verify')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Verify
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleKycAction(user.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View User Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">KYC Status</p>
                    <div className="mt-1">{getKycBadge(selectedUser.kycStatus)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <Badge variant={selectedUser.isActive ? 'default' : 'secondary'} className="mt-1">
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {selectedUser.farmName && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Farm Name</p>
                      <p className="font-medium">{selectedUser.farmName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Registered</p>
                    <p className="font-medium">{selectedUser.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">{selectedUser.lastLogin}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deactivate Confirmation Dialog */}
        <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser?.isActive ? 'Deactivate User' : 'Activate User'}
              </DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to {selectedUser?.isActive ? 'deactivate' : 'activate'}{' '}
              <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>?
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                variant={selectedUser?.isActive ? 'destructive' : 'default'}
                onClick={handleDeactivateConfirm}
              >
                {selectedUser?.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
