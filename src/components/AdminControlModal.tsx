import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Gamepad2,
  Users,
  Megaphone,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Key,
  RotateCcw,
  Download,
  BarChart2,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  UserPlus,
  Settings,
  Rocket,
  Flame,
  Zap,
  Star,
  MessageSquare,
  Clock,
  Edit2,
  Activity,
  Check,
  Ban,
  Filter,
  Crown,
  Award,
  Mail,
  FileSpreadsheet,
  ExternalLink,
  Inbox,
  MessageSquareQuote,
  CheckCircle,
  Copy,
  Send,
  Coins,
  Snowflake,
  Gift,
  Sliders,
  Database,
  Upload,
  FolderDown,
  TrendingUp,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { Game, CategoryType } from '../types';
import {
  getAllGames,
  addCustomGame,
  toggleHideGame,
  deleteGame,
  removeAllGames,
  restoreDefaultGames,
  setGamePlayCount,
  resetAllPlayCounts,
  getHiddenGameIds,
  getSiteAnnouncement,
  setSiteAnnouncement,
  formatPlayCount,
  toggleGameFlag,
  updateGameDetails,
  getAuditLogs,
  addAuditLog,
  clearAuditLogs,
  getSiteConfig,
  saveSiteConfig,
  getGameSuggestions,
  updateSuggestionStatus,
  deleteGameSuggestion,
  getContactSubmissions,
  updateContactSubmissionStatus,
  deleteContactSubmission,
  getGameFeedbackList,
  adminProcessFeedback,
  deleteGameFeedback,
  AuditLog,
  SiteConfig,
  GameSuggestion,
  ContactSubmission,
  GameFeedback,
} from '../data/gamesData';
import {
  UpcomingGame,
  getUpcomingGames,
  addUpcomingGame,
  deleteUpcomingGame,
} from '../data/comingSoonData';
import {
  getAllUserRecords,
  getCurrentSessionUser,
  deleteUserAccount,
  updateUserPassword,
  toggleUserAdminStatus,
  registerAccount,
  UserAccount,
  resetAllTestAccountsAdmin,
  generateNewTestPass,
  resetDeviceTestAccountFlag,
  isPassLimitOverrideActive,
  setPassLimitOverride,
  getPassLimitMaxCount,
  setPassLimitMaxCount,
  resetSingleAccountPassLock,
  hasDeviceUsedTestAccount,
  toggleUserVipStatus,
  setUserVipLevel,
  promoteAllUsersToVip,
  generateNewVipAccount,
  setUserPointsBalance,
  grantMassPointBonus,
  getAllPendingVipOrders,
  adminApproveVipOrderByUsername,
  adminRejectVipOrderByUsername,
  syncUsersWithServer,
  saveUsers,
} from '../utils/auth';
import {
  resetAllLeaderboardsToZero,
  resetGameLeaderboardToZero,
} from '../utils/leaderboards';

interface AdminControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGamesUpdated: () => void;
  onAnnouncementUpdated: () => void;
}

export const AdminControlModal: React.FC<AdminControlModalProps> = ({
  isOpen,
  onClose,
  onGamesUpdated,
  onAnnouncementUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'vip_approvals' | 'games' | 'feedback' | 'suggestions' | 'contact' | 'upcoming' | 'users' | 'analytics' | 'tools' | 'backup_export'
  >('overview');

  // Manual VIP Granter state
  const [manualVipTargetUser, setManualVipTargetUser] = useState('');
  const [manualVipTierSelect, setManualVipTierSelect] = useState<'Gold' | 'Platinum' | 'Diamond' | 'None'>('Gold');

  // Announcement state
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  // Game Feedback state
  const [feedbackList, setFeedbackList] = useState<GameFeedback[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'pending' | 'reviewed' | 'rewarded'>('pending');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [grantBonusInputs, setGrantBonusInputs] = useState<Record<string, number>>({});
  const [grantNoteInputs, setGrantNoteInputs] = useState<Record<string, string>>({});

  // Games state
  const [allGamesList, setAllGamesList] = useState<Game[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [gameSearch, setGameSearch] = useState('');
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Community Suggestions Sheet state
  const [suggestionsList, setSuggestionsList] = useState<GameSuggestion[]>([]);
  const [suggestionFilter, setSuggestionFilter] = useState<'all' | 'pending' | 'approved' | 'dismissed'>('pending');
  const [suggestionSearch, setSuggestionSearch] = useState('');
  const [showEmbeddedForm, setShowEmbeddedForm] = useState(false);

  // Contact Me Sheet state
  const [contactList, setContactList] = useState<ContactSubmission[]>([]);
  const [contactFilter, setContactFilter] = useState<'all' | 'unread' | 'read' | 'replied' | 'archived'>('all');
  const [contactSearch, setContactSearch] = useState('');
  const [copiedEmailMsg, setCopiedEmailMsg] = useState(false);

  // Coming Soon games state
  const [upcomingGamesList, setUpcomingGamesList] = useState<UpcomingGame[]>([]);
  const [showAddUpcomingForm, setShowAddUpcomingForm] = useState(false);
  const [newUpcomingTitle, setNewUpcomingTitle] = useState('');
  const [newUpcomingCategory, setNewUpcomingCategory] = useState<CategoryType>('Arcade');
  const [newUpcomingDesc, setNewUpcomingDesc] = useState('');
  const [newUpcomingRelease, setNewUpcomingRelease] = useState('Coming Soon');
  const [newUpcomingThumb, setNewUpcomingThumb] = useState('');
  const [newUpcomingTags, setNewUpcomingTags] = useState('upcoming, beta');
  const [newUpcomingStatus, setNewUpcomingStatus] = useState<'In Development' | 'Testing Beta' | 'Porting HTML5' | 'Community Priority'>('In Development');
  const [newUpcomingProgress, setNewUpcomingProgress] = useState(70);
  const [newUpcomingNotes, setNewUpcomingNotes] = useState('');
  const [addUpcomingSuccess, setAddUpcomingSuccess] = useState('');
  
  // Add Game form state
  const [showAddGameForm, setShowAddGameForm] = useState(false);
  const [newGameTitle, setNewGameTitle] = useState('');
  const [newGameCategory, setNewGameCategory] = useState<CategoryType>('Arcade');
  const [newGameDesc, setNewGameDesc] = useState('');
  const [newGameThumb, setNewGameThumb] = useState('');
  const [newGameEmbed, setNewGameEmbed] = useState('');
  const [newGameTags, setNewGameTags] = useState('arcade, fun');
  const [addGameSuccess, setAddGameSuccess] = useState('');

  // Users state
  const [usersList, setUsersList] = useState<(UserAccount & { passwordHash: string })[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [editingUserPass, setEditingUserPass] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [userMsg, setUserMsg] = useState('');

  // Add User Form
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  // Pass Limit Override state
  const [passOverrideActive, setPassOverrideActive] = useState<boolean>(isPassLimitOverrideActive());
  const [passMaxCount, setPassMaxCountState] = useState<number>(getPassLimitMaxCount());
  const [devicePassBlocked, setDevicePassBlocked] = useState<boolean>(hasDeviceUsedTestAccount());

  // Audit Logs & Analytics state
  const [auditLogsList, setAuditLogsList] = useState<AuditLog[]>([]);
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<'all' | 'games' | 'users' | 'system' | 'broadcast'>('all');

  // Site Config state
  const [siteConfigState, setSiteConfigState] = useState<SiteConfig>(getSiteConfig());
  const [configSaved, setConfigSaved] = useState(false);

  // VIP Pending Orders Queue state
  const [pendingVipOrders, setPendingVipOrders] = useState<{ username: string; name?: string; email?: string; pending: any }[]>([]);

  // Load Data
  const refreshData = () => {
    const games = getAllGames(true); // include hidden
    setAllGamesList(games);
    setHiddenIds(getHiddenGameIds());
    setUsersList(getAllUserRecords());
    setUpcomingGamesList(getUpcomingGames());
    setSuggestionsList(getGameSuggestions());
    setContactList(getContactSubmissions());
    setFeedbackList(getGameFeedbackList());
    setAuditLogsList(getAuditLogs());
    setSiteConfigState(getSiteConfig());
    setPassOverrideActive(isPassLimitOverrideActive());
    setPassMaxCountState(getPassLimitMaxCount());
    setDevicePassBlocked(hasDeviceUsedTestAccount());
    setPendingVipOrders(getAllPendingVipOrders());

    const ann = getSiteAnnouncement();
    setAnnouncementMsg(ann.message);
    setAnnouncementActive(ann.active);
  };

  const handleTogglePassLimitOverride = () => {
    const newState = !passOverrideActive;
    setPassLimitOverride(newState);
    setPassOverrideActive(newState);
    addAuditLog('users', `Pass Limit Override changed to ${newState ? 'ENABLED' : 'DISABLED'} by Admin`);
    setUserMsg(`Pass Limit Override is now ${newState ? 'ENABLED (Pass limits bypassed)' : 'DISABLED (Standard pass limits active)'}`);
    refreshData();
    setTimeout(() => setUserMsg(''), 4000);
  };

  const handleUpdateMaxPassCount = (count: number) => {
    setPassLimitMaxCount(count);
    setPassMaxCountState(count);
    addAuditLog('users', `Max Test Passes Per Device set to ${count}`);
    setUserMsg(`Max test pass count limit per device set to ${count}`);
    setTimeout(() => setUserMsg(''), 3000);
  };

  const handleResetDevicePassLock = () => {
    resetDeviceTestAccountFlag();
    setDevicePassBlocked(false);
    addAuditLog('users', 'Cleared local device test account pass restrictions');
    setUserMsg('Local device test account restriction cleared successfully!');
    refreshData();
    setTimeout(() => setUserMsg(''), 3000);
  };

  const handleResetAccountPassLock = (username: string) => {
    resetSingleAccountPassLock(username);
    addAuditLog('users', `Reset test pass lock for account: ${username}`);
    setUserMsg(`Reset test pass lock for "${username}"! Account is available again.`);
    refreshData();
    setTimeout(() => setUserMsg(''), 3000);
  };

  const handleGenerateTestPass = () => {
    const newPass = generateNewTestPass();
    addAuditLog('users', `Generated new test pass account: ${newPass.username}`);
    setUserMsg(`Created new test pass: Username "${newPass.username}", Password "${newPass.passwordHash}"`);
    refreshData();
    setTimeout(() => setUserMsg(''), 6000);
  };

  const handleResetTestAccounts = () => {
    resetAllTestAccountsAdmin();
    addAuditLog('users', 'Reset all test accounts and device restrictions');
    setUserMsg('Reset all test pass accounts and cleared device restrictions!');
    refreshData();
    setTimeout(() => setUserMsg(''), 4000);
  };

  const handleToggleVip = (username: string, currentIsVip?: boolean) => {
    toggleUserVipStatus(username, 'Gold');
    addAuditLog('users', `Toggled VIP status for user ${username} to ${!currentIsVip}`);
    setUserMsg(`User "${username}" VIP status updated to ${!currentIsVip ? 'VIP GOLD 👑' : 'REGULAR'}!`);
    refreshData();
    setTimeout(() => setUserMsg(''), 3000);
  };

  const handleSetVipLevel = (username: string, level: 'Gold' | 'Diamond' | 'Platinum' | 'VIP') => {
    setUserVipLevel(username, level);
    addAuditLog('users', `Updated VIP tier for user ${username} to ${level}`);
    setUserMsg(`User "${username}" upgraded to VIP ${level} 👑 status!`);
    refreshData();
    setTimeout(() => setUserMsg(''), 3000);
  };

  const handlePromoteAllToVip = () => {
    if (confirm('Promote ALL registered user accounts to VIP Gold status?')) {
      promoteAllUsersToVip('Gold');
      addAuditLog('users', 'Promoted ALL user accounts to VIP Gold status');
      setUserMsg('All registered user accounts have been upgraded to VIP Gold! 👑');
      refreshData();
      setTimeout(() => setUserMsg(''), 4000);
    }
  };

  const handleGenerateVipAccount = (tier: 'Gold' | 'Diamond' | 'Platinum' = 'Gold') => {
    const acc = generateNewVipAccount(tier);
    addAuditLog('users', `Generated new VIP ${tier} account: ${acc.username}`);
    setUserMsg(`Created VIP ${tier} Account: Username "${acc.username}", Password "${acc.passwordHash}"`);
    refreshData();
    setTimeout(() => setUserMsg(''), 6000);
  };

  const handleApproveVipOrder = (targetUsername: string) => {
    if (adminApproveVipOrderByUsername(targetUsername)) {
      addAuditLog('users', `Admin approved pending VIP pass order for ${targetUsername}`);
      setUserMsg(`🎉 Approved & Activated VIP Pass for user "${targetUsername}"!`);
      refreshData();
      setTimeout(() => setUserMsg(''), 4000);
    }
  };

  const handleRejectVipOrder = (targetUsername: string) => {
    if (confirm(`Reject VIP pass order for user "${targetUsername}" and refund their points?`)) {
      if (adminRejectVipOrderByUsername(targetUsername)) {
        addAuditLog('users', `Admin rejected VIP pass order for ${targetUsername} and refunded points`);
        setUserMsg(`Rejected VIP order for "${targetUsername}". Points refunded!`);
        refreshData();
        setTimeout(() => setUserMsg(''), 4000);
      }
    }
  };

  const handleAdjustPoints = (username: string, delta: number) => {
    const userRec = usersList.find((u) => u.username.toLowerCase() === username.toLowerCase());
    const current = userRec ? (userRec.points || 10) : 10;
    const next = Math.max(0, current + delta);
    setUserPointsBalance(username, next);
    addAuditLog('users', `Adjusted points for ${username} by ${delta > 0 ? '+' : ''}${delta} PTS (New balance: ${next})`);
    setUserMsg(`Updated "${username}" point balance to 🪙 ${next} PTS`);
    refreshData();
    setTimeout(() => setUserMsg(''), 3000);
  };

  const handleMassAirdrop = (amount: number) => {
    if (confirm(`Airdrop 🪙 +${amount} PTS bonus to ALL registered accounts?`)) {
      const count = grantMassPointBonus(amount);
      addAuditLog('users', `Airdropped +${amount} PTS bonus to ${count} registered users`);
      setUserMsg(`🎉 Mass Airdrop Successful! Granted +${amount} PTS to ${count} user accounts!`);
      refreshData();
      setTimeout(() => setUserMsg(''), 4000);
    }
  };

  const handleExportJsonBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      version: '2.0-GAMELAND',
      users: getAllUserRecords().map(({ passwordHash, ...rest }) => ({
        ...rest,
        passwordHash: '[REDACTED_FOR_PRIVACY]',
      })),
      games: getAllGames(true),
      suggestions: getGameSuggestions(),
      contactSubmissions: getContactSubmissions(),
      feedback: getGameFeedbackList(),
      auditLogs: getAuditLogs(),
      siteConfig: getSiteConfig(),
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gameland-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditLog('system', 'Exported full JSON site system database backup');
    setUserMsg('Downloaded full JSON site backup!');
    setTimeout(() => setUserMsg(''), 3000);
  };

  const handleExportUsersCsv = () => {
    const users = getAllUserRecords();
    let csvContent = 'data:text/csv;charset=utf-8,Username,Role,VIP Status,VIP Tier,Points,Registered Date\n';
    users.forEach((u) => {
      csvContent += `"${u.username}","${u.isAdmin ? 'Admin' : 'User'}","${u.isVip ? 'VIP' : 'Free'}","${u.vipLevel || 'None'}",${u.points || 0},"${u.createdAt || ''}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gameland-users-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog('system', 'Exported user accounts list to CSV');
  };

  const handleExportFeedbackCsv = () => {
    const list = getGameFeedbackList();
    let csvContent = 'data:text/csv;charset=utf-8,ID,Game Title,Username,Feedback Type,Rating,Comment,Points Awarded,Status,Submitted At\n';
    list.forEach((f) => {
      csvContent += `"${f.id}","${f.gameTitle}","${f.username}","${f.feedbackType}",${f.rating},"${(f.comment || '').replace(/"/g, '""')}",${f.upfrontPoints || 0},"${f.status}","${f.submittedAt}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gameland-feedback-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog('system', 'Exported game feedback to CSV');
  };

  const handleExportAuditLogsCsv = () => {
    const logs = getAuditLogs();
    let csvContent = 'data:text/csv;charset=utf-8,Timestamp,Action,Category,Details\n';
    logs.forEach((l) => {
      csvContent += `"${l.timestamp}","${(l.action || '').replace(/"/g, '""')}","${l.category}","${(l.details || '').replace(/"/g, '""')}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gameland-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog('system', 'Exported audit logs to CSV');
  };

  const handleImportJsonBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.users && Array.isArray(data.users)) {
          const formattedUsers: Record<string, any> = {};
          data.users.forEach((u: any) => {
            if (u && u.username) formattedUsers[u.username.toLowerCase()] = u;
          });
          saveUsers(formattedUsers);
        } else if (data.users && typeof data.users === 'object') {
          saveUsers(data.users);
        }
        if (data.siteConfig) {
          saveSiteConfig(data.siteConfig);
        }
        refreshData();
        setUserMsg('✅ Successfully restored site database from JSON backup!');
        setTimeout(() => setUserMsg(''), 4000);
      } catch (err) {
        alert('Failed to parse JSON backup file. Please ensure it is a valid GameLand backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleManualGrantVipTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualVipTargetUser) return;
    if (manualVipTierSelect === 'None') {
      toggleUserVipStatus(manualVipTargetUser, 'Gold');
      addAuditLog('users', `Admin revoked VIP status for ${manualVipTargetUser}`);
      setUserMsg(`Revoked VIP status for user "${manualVipTargetUser}"`);
    } else {
      setUserVipLevel(manualVipTargetUser, manualVipTierSelect);
      addAuditLog('users', `Admin granted VIP ${manualVipTierSelect} to ${manualVipTargetUser}`);
      setUserMsg(`🎉 Granted VIP ${manualVipTierSelect} to user "${manualVipTargetUser}"!`);
    }
    setManualVipTargetUser('');
    refreshData();
    setTimeout(() => setUserMsg(''), 4000);
  };

  const handleSaveSiteConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSiteConfig(siteConfigState);
    setConfigSaved(true);
    addAuditLog('system', `Updated site configuration settings: ${JSON.stringify(siteConfigState)}`);
    setUserMsg('Site system configuration saved!');
    setTimeout(() => {
      setConfigSaved(false);
      setUserMsg('');
    }, 3000);
  };

  const handleAddUpcomingGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpcomingTitle) return;

    addUpcomingGame({
      title: newUpcomingTitle,
      category: newUpcomingCategory,
      description: newUpcomingDesc || 'New upcoming game preview.',
      estimatedRelease: newUpcomingRelease || 'Coming Soon',
      thumbnailUrl:
        newUpcomingThumb ||
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600',
      tags: newUpcomingTags.split(',').map((t) => t.trim()).filter(Boolean),
      status: newUpcomingStatus,
      progress: Math.min(100, Math.max(0, Number(newUpcomingProgress) || 50)),
      developerNotes: newUpcomingNotes || undefined,
    });

    setAddUpcomingSuccess(`Added upcoming title "${newUpcomingTitle}"!`);
    setNewUpcomingTitle('');
    setNewUpcomingDesc('');
    setNewUpcomingRelease('Coming Soon');
    setNewUpcomingThumb('');
    setNewUpcomingNotes('');
    setShowAddUpcomingForm(false);
    refreshData();

    setTimeout(() => setAddUpcomingSuccess(''), 4000);
  };

  const handleDeleteUpcomingGame = (id: string, title: string) => {
    if (confirm(`Remove upcoming game "${title}"?`)) {
      deleteUpcomingGame(id);
      refreshData();
    }
  };

  // Suggestion Handlers
  const handleUpdateSuggestionStatus = (id: string, status: 'pending' | 'approved' | 'dismissed') => {
    updateSuggestionStatus(id, status);
    refreshData();
  };

  // Feedback Handlers
  const handleProcessFeedback = (id: string, customBonus?: number) => {
    const amountToGrant = customBonus !== undefined ? customBonus : (grantBonusInputs[id] !== undefined ? grantBonusInputs[id] : 15);
    const notes = grantNoteInputs[id] || '';

    const res = adminProcessFeedback(id, amountToGrant, notes, amountToGrant > 0 ? 'bonus_awarded' : 'processed');
    if (res.success) {
      if (amountToGrant > 0) {
        setUserMsg(`🎉 Granted +${amountToGrant} bonus PTS and processed feedback!`);
      } else {
        setUserMsg(`Processed feedback (No bonus awarded).`);
      }
      refreshData();
      setTimeout(() => setUserMsg(''), 4000);
    }
  };

  const handleDeleteFeedback = (id: string) => {
    if (confirm('Delete this game feedback entry?')) {
      deleteGameFeedback(id);
      refreshData();
      setUserMsg('Deleted feedback entry');
      setTimeout(() => setUserMsg(''), 3000);
    }
  };

  const handleDeleteSuggestion = (id: string) => {
    deleteGameSuggestion(id);
    refreshData();
  };

  const handleApproveAndPublishSuggestion = (sugg: GameSuggestion) => {
    updateSuggestionStatus(sugg.id, 'approved');
    setNewGameTitle(sugg.gameTitle);
    setNewGameCategory((sugg.category as CategoryType) || 'Arcade');
    setNewGameDesc(sugg.description || '');
    if (sugg.webUrl) {
      setNewGameEmbed(sugg.webUrl);
    }
    setShowAddGameForm(true);
    setActiveTab('games');
    refreshData();
  };

  // Contact Handlers
  const handleUpdateContactStatus = (id: string, status: 'unread' | 'read' | 'replied' | 'archived') => {
    updateContactSubmissionStatus(id, status);
    refreshData();
  };

  const handleDeleteContact = (id: string) => {
    deleteContactSubmission(id);
    refreshData();
  };

  const handleCopyAdminEmail = () => {
    navigator.clipboard.writeText('ishaany83@gmail.com');
    setCopiedEmailMsg(true);
    setTimeout(() => setCopiedEmailMsg(false), 2000);
  };

  useEffect(() => {
    if (isOpen) {
      syncUsersWithServer().then(() => refreshData());
      refreshData();
      const handleUserUpdate = () => refreshData();
      window.addEventListener('gameland_users_updated', handleUserUpdate);

      // Auto-poll the server every 3.5 seconds to guarantee all newly registered users appear live
      const pollInterval = setInterval(() => {
        syncUsersWithServer().then(() => refreshData());
      }, 3500);

      return () => {
        window.removeEventListener('gameland_users_updated', handleUserUpdate);
        clearInterval(pollInterval);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'users') {
      syncUsersWithServer().then(() => refreshData());
    }
  }, [isOpen, activeTab]);

  const sessionUser = getCurrentSessionUser();
  const isActualAdmin = !!(sessionUser?.isAdmin || sessionUser?.username.toLowerCase() === 'pebblesthepenguinishaany83');

  if (!isOpen || !isActualAdmin) return null;

  // Announcement Save
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setSiteAnnouncement(announcementMsg, announcementActive);
    setAnnouncementSaved(true);
    onAnnouncementUpdated();
    setTimeout(() => setAnnouncementSaved(false), 3000);
  };

  // Add Custom Game Submit
  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameTitle || !newGameEmbed) return;

    addCustomGame({
      title: newGameTitle,
      slug: newGameTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: newGameCategory,
      description: newGameDesc || 'Custom added game in GameLand',
      thumbnailUrl:
        newGameThumb ||
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600',
      embedUrl: newGameEmbed,
      tags: newGameTags.split(',').map((t) => t.trim()).filter(Boolean),
      rating: 4.9,
      controls: [{ key: 'Mouse / Arrows', action: 'Play Game' }],
      isCustom: true,
      isNew: true,
    });

    setAddGameSuccess(`Successfully added "${newGameTitle}"!`);
    setNewGameTitle('');
    setNewGameDesc('');
    setNewGameThumb('');
    setNewGameEmbed('');
    setShowAddGameForm(false);
    refreshData();
    onGamesUpdated();

    setTimeout(() => setAddGameSuccess(''), 4000);
  };

  // Toggle Hide Game
  const handleToggleHide = (id: string) => {
    toggleHideGame(id);
    refreshData();
    onGamesUpdated();
  };

  // Delete Game
  const handleDeleteGame = (id: string) => {
    if (confirm('Are you sure you want to remove this game from GameLand?')) {
      deleteGame(id);
      refreshData();
      onGamesUpdated();
    }
  };

  const handleRemoveAllGames = () => {
    if (confirm('Are you sure you want to remove ALL games from the portal?')) {
      removeAllGames();
      addAuditLog('games', 'Admin removed all games from portal');
      setUserMsg('All games have been removed from the portal.');
      refreshData();
      onGamesUpdated();
      setTimeout(() => setUserMsg(''), 4000);
    }
  };

  const handleRestoreDefaultGames = () => {
    if (confirm('Restore default built-in games to the catalog?')) {
      restoreDefaultGames();
      addAuditLog('games', 'Admin restored default built-in games');
      setUserMsg('Default built-in games catalog restored!');
      refreshData();
      onGamesUpdated();
      setTimeout(() => setUserMsg(''), 4000);
    }
  };

  // Edit Play Count
  const handleUpdatePlayCount = (id: string, current: number, delta: number) => {
    const next = Math.max(0, current + delta);
    setGamePlayCount(id, next);
    refreshData();
    onGamesUpdated();
  };

  // User Actions
  const handleToggleAdmin = (username: string) => {
    toggleUserAdminStatus(username);
    refreshData();
  };

  const handleDeleteUser = (username: string) => {
    if (confirm(`Are you sure you want to delete user account "${username}"?`)) {
      if (deleteUserAccount(username)) {
        setUserMsg(`Deleted user ${username}`);
      } else {
        setUserMsg(`Cannot delete primary admin account.`);
      }
      refreshData();
      setTimeout(() => setUserMsg(''), 3000);
    }
  };

  const handleUpdatePassword = (username: string) => {
    if (!newPasswordInput || newPasswordInput.length < 4) {
      setUserMsg('Password must be at least 4 characters');
      return;
    }
    if (updateUserPassword(username, newPasswordInput)) {
      setUserMsg(`Password updated for ${username}`);
      setEditingUserPass(null);
      setNewPasswordInput('');
      refreshData();
    } else {
      setUserMsg('Failed to update password');
    }
    setTimeout(() => setUserMsg(''), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerAccount(newUsername, newUserPassword, newName, newEmail);
    if (res.success) {
      setUserMsg(`Created user account ${newUsername}`);
      setNewUsername('');
      setNewName('');
      setNewEmail('');
      setNewUserPassword('');
      setShowAddUserForm(false);
      refreshData();
    } else {
      setUserMsg(res.error || 'Failed to create account');
    }
    setTimeout(() => setUserMsg(''), 3000);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      games: allGamesList,
      users: usersList,
      announcement: getSiteAnnouncement(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gameland-admin-backup-${Date.now()}.json`;
    a.click();
  };

  const totalPlaysAllGames = allGamesList.reduce((acc, g) => acc + (g.playCount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        id="admin-control-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-amber-500/20 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  GameLand Control Panel
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold uppercase tracking-wider">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pebbles Master Admin Dashboard & Platform Controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            id="close-admin-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 px-3 sm:px-6 bg-slate-900 border-b border-slate-800 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('vip_approvals')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
              activeTab === 'vip_approvals'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-400/60 shadow-md font-black'
                : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/10'
            }`}
            id="admin-tab-vip-approvals-btn"
          >
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span>VIP Pass Requests</span>
            {pendingVipOrders.length > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-bounce shadow-sm">
                {pendingVipOrders.length}
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                0
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'games'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Games Manager ({allGamesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
              activeTab === 'feedback'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="admin-tab-feedback-btn"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Game Feedback ({feedbackList.length})</span>
            {feedbackList.filter((f) => f.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
                {feedbackList.filter((f) => f.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
              activeTab === 'suggestions'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>Suggest Games Sheet</span>
            {suggestionsList.filter((s) => s.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
                {suggestionsList.filter((s) => s.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
              activeTab === 'contact'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>Contact Me Sheet</span>
            {contactList.filter((c) => c.status === 'unread').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black animate-pulse">
                {contactList.filter((c) => c.status === 'unread').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Rocket className="w-4 h-4 text-cyan-400" />
            <span>Coming Soon ({upcomingGamesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Analytics & Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('backup_export')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'backup_export'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="admin-tab-backup-export-btn"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>📁 Data Backup & Export</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'tools'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Config & Tools</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60 space-y-6">
          {/* TAB 1: OVERVIEW & ANNOUNCEMENTS */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Total Games</span>
                    <Gamepad2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{allGamesList.length}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {allGamesList.filter((g) => g.isCustom).length} custom games added
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Total Plays</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {formatPlayCount(totalPlaysAllGames)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Across all titles</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>User Accounts</span>
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{usersList.length}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {usersList.filter((u) => u.isAdmin).length} admin account(s)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-md">
                  <div className="flex items-center justify-between text-amber-400 text-xs mb-2">
                    <span>Primary Admin</span>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-sm font-extrabold text-amber-200 truncate font-mono">
                    Pebblesthepenguin
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>System Online</span>
                  </div>
                </div>
              </div>

              {/* Site Announcement Broadcast Section */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">
                        Site-Wide Broadcast Announcement
                      </h3>
                      <p className="text-xs text-slate-400">
                        Display a notice banner at the top of GameLand for all visiting users.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementActive}
                      onChange={(e) => setAnnouncementActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    <span className="ml-2 text-xs font-bold text-slate-300">
                      {announcementActive ? 'Active' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <form onSubmit={handleSaveAnnouncement} className="space-y-3">
                  <textarea
                    value={announcementMsg}
                    onChange={(e) => setAnnouncementMsg(e.target.value)}
                    rows={2}
                    placeholder="Enter broadcast message (e.g. Welcome to GameLand! Check out the new games added today!)..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50 resize-none font-medium"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {announcementActive ? '🟢 Live broadcast is ON' : '🔴 Banner is hidden'}
                    </span>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                    >
                      {announcementSaved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Announcement Updated!</span>
                        </>
                      ) : (
                        <>
                          <Megaphone className="w-4 h-4" />
                          <span>Broadcast Announcement</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: GAME MANAGER */}
          {activeTab === 'games' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Search games catalog..."
                  value={gameSearch}
                  onChange={(e) => setGameSearch(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50 min-w-[220px]"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRemoveAllGames}
                    className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    title="Remove all games from the portal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove All Games</span>
                  </button>

                  <button
                    onClick={handleRestoreDefaultGames}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Restore default games"
                  >
                    <span>Restore Default Catalog</span>
                  </button>

                  <button
                    onClick={() => setShowAddGameForm(!showAddGameForm)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{showAddGameForm ? 'Close Add Form' : 'Add Custom Game'}</span>
                  </button>
                </div>
              </div>

              {addGameSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{addGameSuccess}</span>
                </div>
              )}

              {/* Add Custom Game Form */}
              {showAddGameForm && (
                <form
                  onSubmit={handleAddGame}
                  className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200"
                >
                  <h3 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    <span>Create & Publish Custom Game</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Game Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={newGameTitle}
                        onChange={(e) => setNewGameTitle(e.target.value)}
                        placeholder="e.g. Retro Space Invaders"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Category
                      </label>
                      <select
                        value={newGameCategory}
                        onChange={(e) => setNewGameCategory(e.target.value as CategoryType)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option value="Arcade">Arcade</option>
                        <option value="Action">Action</option>
                        <option value="Puzzle">Puzzle</option>
                        <option value="Sports">Sports</option>
                        <option value="Racing">Racing</option>
                        <option value="Strategy">Strategy</option>
                        <option value="Retro">Retro</option>
                        <option value="Proxies">Proxies</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Embed URL or iFrame Source *
                      </label>
                      <input
                        type="text"
                        required
                        value={newGameEmbed}
                        onChange={(e) => setNewGameEmbed(e.target.value)}
                        placeholder="e.g. https://play.game-url.com or https://example.com/embed"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Thumbnail Image URL
                      </label>
                      <input
                        type="url"
                        value={newGameThumb}
                        onChange={(e) => setNewGameThumb(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={newGameTags}
                        onChange={(e) => setNewGameTags(e.target.value)}
                        placeholder="arcade, space, 2d"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newGameDesc}
                        onChange={(e) => setNewGameDesc(e.target.value)}
                        placeholder="Short description of the game..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddGameForm(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
                    >
                      Publish Custom Game
                    </button>
                  </div>
                </form>
              )}

              {/* Games List Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Game</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Play Count</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {allGamesList
                        .filter(
                          (g) =>
                            !gameSearch ||
                            g.title.toLowerCase().includes(gameSearch.toLowerCase()) ||
                            g.category.toLowerCase().includes(gameSearch.toLowerCase())
                        )
                        .map((game) => {
                          const isHidden = hiddenIds.includes(game.id);
                          return (
                            <tr
                              key={game.id}
                              className={`hover:bg-slate-800/40 transition-colors ${
                                isHidden ? 'opacity-50 bg-slate-950/40' : ''
                              }`}
                            >
                              <td className="py-2.5 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={game.thumbnailUrl}
                                    alt={game.title}
                                    className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                                  />
                                  <div>
                                    <div className="font-extrabold text-white flex items-center gap-1.5">
                                      <span>{game.title}</span>
                                      {game.isCustom && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-black">
                                          Custom
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                      {game.slug}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-2.5 px-4 font-semibold text-slate-400">
                                {game.category}
                              </td>

                              <td className="py-2.5 px-4">
                                <div className="flex items-center gap-2 font-mono">
                                  <span className="font-bold text-amber-400">
                                    {formatPlayCount(game.playCount)}
                                  </span>
                                  <button
                                    onClick={() => handleUpdatePlayCount(game.id, game.playCount, 100)}
                                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono"
                                    title="Add 100 plays"
                                  >
                                    +100
                                  </button>
                                </div>
                              </td>

                              <td className="py-2.5 px-4">
                                {isHidden ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                                    <EyeOff className="w-3 h-3" />
                                    Hidden
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                    <Eye className="w-3 h-3" />
                                    Published
                                  </span>
                                )}
                              </td>

                              <td className="py-2.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleToggleHide(game.id)}
                                    className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                                      isHidden
                                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                    }`}
                                    title={isHidden ? 'Unhide Game' : 'Hide Game'}
                                  >
                                    {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteGame(game.id)}
                                    className="p-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
                                    title="Delete Game"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GAME FEEDBACK SHEET & POINT REWARDS */}
          {activeTab === 'feedback' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-amber-500/30">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                    <span>User Game Feedback & Point Processing</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Users submit game feedback for Admin review. <strong className="text-amber-400">No points are given before processing.</strong> Review entries below and grant point rewards (<strong className="text-amber-400">+5 to +50 PTS</strong>) upon processing!
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Feedback Submissions</span>
                    <span className="text-amber-300 font-extrabold text-sm">{feedbackList.length} Entries</span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(['all', 'pending', 'bonus_awarded', 'processed'] as const).map((st) => {
                    const count =
                      st === 'all'
                        ? feedbackList.length
                        : feedbackList.filter((f) => f.status === st).length;
                    return (
                      <button
                        key={st}
                        onClick={() => setFeedbackFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                          feedbackFilter === st
                            ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                            : 'bg-slate-800/80 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{st === 'bonus_awarded' ? 'Points Awarded' : st}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          feedbackFilter === st ? 'bg-slate-950 text-amber-300 font-bold' : 'bg-slate-900 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                    placeholder="Search game title, user, or comment..."
                    className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Feedback Submissions Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-3.5 sm:p-4">Game & User</th>
                        <th className="p-3.5 sm:p-4">Feedback & Rating</th>
                        <th className="p-3.5 sm:p-4">Reward Status</th>
                        <th className="p-3.5 sm:p-4">Review Status</th>
                        <th className="p-3.5 sm:p-4 text-right">Process & Grant Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {feedbackList
                        .filter((item) => {
                          if (feedbackFilter !== 'all' && item.status !== feedbackFilter) return false;
                          if (feedbackSearch) {
                            const query = feedbackSearch.toLowerCase();
                            return (
                              item.gameTitle.toLowerCase().includes(query) ||
                              item.username.toLowerCase().includes(query) ||
                              item.comment.toLowerCase().includes(query)
                            );
                          }
                          return true;
                        })
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3.5 sm:p-4">
                              <div className="font-black text-white text-sm">{item.gameTitle}</div>
                              <div className="text-amber-300 font-bold mt-0.5 flex items-center gap-1">
                                <span>@{item.username}</span>
                                <span className="text-[10px] text-slate-500 font-normal">
                                  ({new Date(item.submittedAt).toLocaleDateString()} {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                </span>
                              </div>
                            </td>

                            <td className="p-3.5 sm:p-4 max-w-md">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-800 border border-slate-700 text-amber-300">
                                  {item.feedbackType}
                                </span>
                                {item.rating && (
                                  <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                                    <span className="font-extrabold">{item.rating}/5</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-slate-200 text-xs leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                                "{item.comment}"
                              </p>
                              {item.adminNotes && (
                                <p className="text-[11px] text-cyan-300 mt-1 italic">
                                  <strong>Admin Note:</strong> {item.adminNotes}
                                </p>
                              )}
                            </td>

                            <td className="p-3.5 sm:p-4">
                              {item.adminBonusPoints && item.adminBonusPoints > 0 ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-black">
                                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>+{item.adminBonusPoints} PTS Granted ✓</span>
                                </div>
                              ) : item.status === 'processed' ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold">
                                  <span>Processed (0 PTS)</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                                  <span>Pending Review (0 PTS)</span>
                                </div>
                              )}
                            </td>

                            <td className="p-3.5 sm:p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  item.status === 'bonus_awarded'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : item.status === 'processed'
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                }`}
                              >
                                {item.status === 'bonus_awarded' ? `Points Granted (+${item.adminBonusPoints || 0} PTS)` : item.status}
                              </span>
                            </td>

                            <td className="p-3.5 sm:p-4 text-right">
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-1.5">
                                  {/* Quick Grant Buttons */}
                                  {[5, 10, 25, 50].map((amt) => (
                                    <button
                                      key={amt}
                                      onClick={() => handleProcessFeedback(item.id, amt)}
                                      className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-black transition-colors"
                                      title={`Grant +${amt} PTS to user and mark processed`}
                                    >
                                      +{amt} PTS
                                    </button>
                                  ))}

                                  <button
                                    onClick={() => handleProcessFeedback(item.id, 0)}
                                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors border border-slate-700"
                                    title="Mark processed without granting points"
                                  >
                                    Mark Processed
                                  </button>

                                  <button
                                    onClick={() => handleDeleteFeedback(item.id)}
                                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors"
                                    title="Delete feedback entry"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {feedbackList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                            No game feedback entries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUGGEST GAMES SHEET & SUBMISSIONS */}
          {activeTab === 'suggestions' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-black text-amber-300">Suggest Games Sheet & Submissions</h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      GOOGLE FORM & SHEET INTEGRATED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl">
                    View all player game requests submitted via the website form or Google Form response sheet. Approve suggestions with 1-click to auto-populate the Game Catalog publisher.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSckADOjOu15l5UGyyibvjLE08PTtSToGhb70VUyMuHOl11YeQ/viewform?usp=publish-editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Google Form Sheet</span>
                  </a>
                  <button
                    onClick={() => setShowEmbeddedForm(!showEmbeddedForm)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showEmbeddedForm ? 'Hide Embedded Form' : 'Preview Embedded Form'}</span>
                  </button>
                </div>
              </div>

              {/* Embedded Form Preview Frame (Collapsible) */}
              {showEmbeddedForm && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Live Embedded Suggestion Form Preview
                    </span>
                    <span className="text-[10px] text-slate-400">Google Forms Iframe</span>
                  </div>
                  <div className="w-full h-96 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <iframe
                      src="https://docs.google.com/forms/d/e/1FAIpQLSckADOjOu15l5UGyyibvjLE08PTtSToGhb70VUyMuHOl11YeQ/viewform?embedded=true"
                      className="w-full h-full border-0"
                      title="Google Form Game Suggestion Preview"
                    >
                      Loading form...
                    </iframe>
                  </div>
                </div>
              )}

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(['all', 'pending', 'approved', 'dismissed'] as const).map((st) => {
                    const count =
                      st === 'all'
                        ? suggestionsList.length
                        : suggestionsList.filter((s) => s.status === st).length;
                    return (
                      <button
                        key={st}
                        onClick={() => setSuggestionFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                          suggestionFilter === st
                            ? 'bg-amber-500 text-slate-950 font-extrabold'
                            : 'bg-slate-800/80 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{st}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          suggestionFilter === st ? 'bg-slate-950 text-amber-300 font-bold' : 'bg-slate-900 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={suggestionSearch}
                    onChange={(e) => setSuggestionSearch(e.target.value)}
                    placeholder="Search game title or user..."
                    className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Suggestions List Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-3.5 sm:p-4">Game Title & Info</th>
                        <th className="p-3.5 sm:p-4">Category</th>
                        <th className="p-3.5 sm:p-4">Submitted By</th>
                        <th className="p-3.5 sm:p-4">Status</th>
                        <th className="p-3.5 sm:p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {suggestionsList
                        .filter((s) => {
                          if (suggestionFilter !== 'all' && s.status !== suggestionFilter) return false;
                          if (suggestionSearch.trim()) {
                            const q = suggestionSearch.toLowerCase();
                            return (
                              s.gameTitle.toLowerCase().includes(q) ||
                              s.submittedBy.toLowerCase().includes(q) ||
                              s.description.toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map((sugg) => (
                          <tr key={sugg.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3.5 sm:p-4">
                              <div className="font-extrabold text-white text-sm">{sugg.gameTitle}</div>
                              <p className="text-[11px] text-slate-400 line-clamp-2 max-w-md mt-0.5">{sugg.description}</p>
                              {sugg.webUrl && (
                                <a
                                  href={sugg.webUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1 mt-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>{sugg.webUrl}</span>
                                </a>
                              )}
                            </td>
                            <td className="p-3.5 sm:p-4 font-semibold text-slate-300">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                                {sugg.category}
                              </span>
                            </td>
                            <td className="p-3.5 sm:p-4">
                              <div className="font-bold text-amber-300">@{sugg.submittedBy}</div>
                              <div className="text-[10px] text-slate-500">
                                {new Date(sugg.submittedAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-3.5 sm:p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  sugg.status === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : sugg.status === 'dismissed'
                                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                                }`}
                              >
                                {sugg.status}
                              </span>
                            </td>
                            <td className="p-3.5 sm:p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {sugg.status !== 'approved' && (
                                  <button
                                    onClick={() => handleApproveAndPublishSuggestion(sugg)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black transition-colors flex items-center gap-1 shadow-sm"
                                    title="Approve and pre-fill Add Custom Game publisher"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Approve & Publish</span>
                                  </button>
                                )}
                                {sugg.status === 'pending' && (
                                  <button
                                    onClick={() => handleUpdateSuggestionStatus(sugg.id, 'dismissed')}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold transition-colors border border-slate-700"
                                  >
                                    Dismiss
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteSuggestion(sugg.id)}
                                  className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors"
                                  title="Delete suggestion record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {suggestionsList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                            No game suggestions submitted yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT ME SHEET & INQUIRIES */}
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-black text-cyan-300">Contact Me Sheet & Inquiries</h3>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                      ADMIN MAIL INBOX
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl">
                    Review all contact requests, player feedback, partnership inquiries, and proxy requests sent directly to creator Ishaan Yadav (<code className="text-cyan-300 font-mono">ishaany83@gmail.com</code>).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyAdminEmail}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    {copiedEmailMsg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmailMsg ? 'Email Copied!' : 'Copy Admin Email'}</span>
                  </button>

                  <a
                    href="mailto:ishaany83@gmail.com?subject=GameLand%20Admin%20Inquiry"
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Compose Email</span>
                  </a>
                </div>
              </div>

              {/* Filter & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(['all', 'unread', 'read', 'replied', 'archived'] as const).map((st) => {
                    const count =
                      st === 'all'
                        ? contactList.length
                        : contactList.filter((c) => c.status === st).length;
                    return (
                      <button
                        key={st}
                        onClick={() => setContactFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                          contactFilter === st
                            ? 'bg-cyan-500 text-slate-950 font-extrabold'
                            : 'bg-slate-800/80 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{st}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          contactFilter === st ? 'bg-slate-950 text-cyan-300 font-bold' : 'bg-slate-900 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search name, email, or message..."
                    className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Messages Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-3.5 sm:p-4">Sender & Info</th>
                        <th className="p-3.5 sm:p-4">Subject & Message</th>
                        <th className="p-3.5 sm:p-4">Date</th>
                        <th className="p-3.5 sm:p-4">Status</th>
                        <th className="p-3.5 sm:p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {contactList
                        .filter((item) => {
                          if (contactFilter !== 'all' && item.status !== contactFilter) return false;
                          if (contactSearch.trim()) {
                            const q = contactSearch.toLowerCase();
                            return (
                              item.name.toLowerCase().includes(q) ||
                              item.email.toLowerCase().includes(q) ||
                              item.subject.toLowerCase().includes(q) ||
                              item.message.toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3.5 sm:p-4">
                              <div className="font-extrabold text-white text-sm">{item.name}</div>
                              <div className="text-[11px] text-cyan-400 font-mono flex items-center gap-1 mt-0.5">
                                <span>{item.email}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.email);
                                    alert(`Copied email ${item.email}`);
                                  }}
                                  className="p-0.5 hover:text-white transition-colors"
                                  title="Copy email address"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="p-3.5 sm:p-4">
                              <div className="font-bold text-slate-200">{item.subject}</div>
                              <p className="text-[11px] text-slate-400 max-w-md line-clamp-3 mt-1 leading-relaxed">
                                {item.message}
                              </p>
                            </td>
                            <td className="p-3.5 sm:p-4 text-[10px] text-slate-500 whitespace-nowrap">
                              {new Date(item.submittedAt).toLocaleDateString()}
                              <div className="text-slate-600">
                                {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="p-3.5 sm:p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  item.status === 'unread'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                    : item.status === 'replied'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : item.status === 'archived'
                                    ? 'bg-slate-800 text-slate-500 border-slate-700'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3.5 sm:p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {item.status === 'unread' ? (
                                  <button
                                    onClick={() => handleUpdateContactStatus(item.id, 'read')}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors border border-slate-700"
                                  >
                                    Mark Read
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUpdateContactStatus(item.id, 'unread')}
                                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] transition-colors"
                                  >
                                    Mark Unread
                                  </button>
                                )}

                                <a
                                  href={`mailto:${item.email}?subject=Re:%20${encodeURIComponent(item.subject)}`}
                                  onClick={() => handleUpdateContactStatus(item.id, 'replied')}
                                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-black transition-colors flex items-center gap-1 shadow-sm"
                                  title="Launch email client to reply"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Reply</span>
                                </a>

                                <button
                                  onClick={() => handleDeleteContact(item.id)}
                                  className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors"
                                  title="Delete contact submission"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {contactList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                            No contact submissions found in inbox.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: COMING SOON MANAGER */}
          {activeTab === 'upcoming' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-cyan-300 flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-cyan-400" />
                    <span>Coming Soon Catalog Manager</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add upcoming game titles for users to vote, upvote, and subscribe to notifications on.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddUpcomingForm(!showAddUpcomingForm)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddUpcomingForm ? 'Close Form' : 'Add Upcoming Game'}</span>
                </button>
              </div>

              {addUpcomingSuccess && (
                <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{addUpcomingSuccess}</span>
                </div>
              )}

              {/* Add Upcoming Game Form */}
              {showAddUpcomingForm && (
                <form
                  onSubmit={handleAddUpcomingGame}
                  className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200"
                >
                  <h3 className="text-sm font-extrabold text-cyan-300 flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    <span>Create Upcoming Title</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Game Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={newUpcomingTitle}
                        onChange={(e) => setNewUpcomingTitle(e.target.value)}
                        placeholder="e.g. Block Blast 2"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Category
                      </label>
                      <select
                        value={newUpcomingCategory}
                        onChange={(e) => setNewUpcomingCategory(e.target.value as CategoryType)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Arcade">Arcade</option>
                        <option value="Action">Action</option>
                        <option value="Puzzle">Puzzle</option>
                        <option value="Sports">Sports</option>
                        <option value="Racing">Racing</option>
                        <option value="Strategy">Strategy</option>
                        <option value="Retro">Retro</option>
                        <option value="Proxies">Proxies</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Estimated Release Date
                      </label>
                      <input
                        type="text"
                        value={newUpcomingRelease}
                        onChange={(e) => setNewUpcomingRelease(e.target.value)}
                        placeholder="e.g. In 2 Weeks / Q3 2026"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Development Status
                      </label>
                      <select
                        value={newUpcomingStatus}
                        onChange={(e) => setNewUpcomingStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                      >
                        <option value="In Development">In Development</option>
                        <option value="Testing Beta">Testing Beta</option>
                        <option value="Porting HTML5">Porting HTML5</option>
                        <option value="Community Priority">Community Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Thumbnail Image URL
                      </label>
                      <input
                        type="url"
                        value={newUpcomingThumb}
                        onChange={(e) => setNewUpcomingThumb(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Dev Progress % ({newUpcomingProgress}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newUpcomingProgress}
                        onChange={(e) => setNewUpcomingProgress(Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={newUpcomingTags}
                        onChange={(e) => setNewUpcomingTags(e.target.value)}
                        placeholder="upcoming, arcade, 3d"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newUpcomingDesc}
                        onChange={(e) => setNewUpcomingDesc(e.target.value)}
                        placeholder="Short description of what users can expect..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Developer Notes
                      </label>
                      <input
                        type="text"
                        value={newUpcomingNotes}
                        onChange={(e) => setNewUpcomingNotes(e.target.value)}
                        placeholder="e.g. Optimizing WebGL shaders and multiplayer servers."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUpcomingForm(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
                    >
                      Publish Upcoming Title
                    </button>
                  </div>
                </form>
              )}

              {/* Upcoming Games List */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
                {upcomingGamesList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No upcoming games listed right now. Click "Add Upcoming Game" above to create one!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Title</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Release</th>
                          <th className="py-3 px-4">Status & Progress</th>
                          <th className="py-3 px-4">Votes / Subs</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {upcomingGamesList.map((game) => (
                          <tr key={game.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={game.thumbnailUrl}
                                  alt={game.title}
                                  className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                                />
                                <div>
                                  <div className="font-extrabold text-white">{game.title}</div>
                                  <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                    {game.description}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-4 font-semibold text-slate-400">
                              {game.category}
                            </td>

                            <td className="py-2.5 px-4 font-bold text-cyan-300">
                              {game.estimatedRelease}
                            </td>

                            <td className="py-2.5 px-4">
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                                  {game.status} ({game.progress}%)
                                </span>
                                <div className="w-24 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                  <div
                                    className="h-full bg-cyan-400 rounded-full"
                                    style={{ width: `${game.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-4 font-mono text-[11px]">
                              <div className="text-amber-400 font-bold">👍 {game.upvotes} votes</div>
                              <div className="text-cyan-400">🔔 {game.subscribersCount} subs</div>
                            </td>

                            <td className="py-2.5 px-4 text-right">
                              <button
                                onClick={() => handleDeleteUpcomingGame(game.id, game.title)}
                                className="p-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
                                title="Delete Upcoming Game"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* VIP ORDERS & APPROVALS QUEUE (FULLFILLMENT DESK) */}
              {pendingVipOrders.length > 0 ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-yellow-950/60 to-slate-900 border-2 border-amber-500 shadow-2xl space-y-3 animate-pulse">
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                          <span>VIP Pass Orders Awaiting Approval</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                            {pendingVipOrders.length} PENDING
                          </span>
                        </h3>
                        <p className="text-xs text-slate-300">
                          Users have purchased VIP passes and are awaiting manual or administrative verification!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {pendingVipOrders.map((ord) => (
                      <div
                        key={ord.username}
                        className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                            <Crown className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <div className="font-extrabold text-white text-xs flex items-center gap-2">
                              <span>User: {ord.username}</span>
                              {ord.name && <span className="text-slate-400">({ord.name})</span>}
                            </div>
                            <div className="text-[11px] text-amber-300 font-medium flex items-center gap-2 mt-0.5">
                              <span>Tier Requested: <strong className="uppercase text-amber-400 font-bold">{ord.pending.vipTier} VIP</strong></span>
                              <span>•</span>
                              <span>Paid: <strong className="font-mono text-amber-400">🪙 {ord.pending.price} PTS</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveVipOrder(ord.username)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1 shadow-md shadow-emerald-500/20"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve & Grant VIP 👑</span>
                          </button>

                          <button
                            onClick={() => handleRejectVipOrder(ord.username)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
                          >
                            <span>Reject & Refund</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No pending VIP Pass orders in queue. All purchases are up to date!</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">VIP Verification Queue Clear</span>
                </div>
              )}

              {/* POINTS & ECONOMY CONTROL BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-yellow-950/30 border border-amber-500/40 shadow-xl space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <Coins className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <span>GameLand Economy & Points Manager</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                          🪙 1 PT / Game Played
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300">
                        Admin powers: Airdrop bonus points to all accounts, modify individual balances, or reset points economy.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleMassAirdrop(250)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-1.5"
                      title="Grant +250 PTS bonus to every registered user account"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Airdrop +250 PTS All Users 🎁</span>
                    </button>

                    <button
                      onClick={() => handleMassAirdrop(1000)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
                      title="Grant +1000 PTS bonus to all users"
                    >
                      <span>+1000 Mega Airdrop</span>
                    </button>
                  </div>
                </div>
              </div>
              {/* PASS LIMIT OVERRIDE BANNER & CONTROLS */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-500/40 shadow-xl space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${passOverrideActive ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white">Pass Limit Override System</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${passOverrideActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                          {passOverrideActive ? 'OVERRIDE ENABLED (Unlimited Pass Uses)' : 'STANDARD LIMITS ACTIVE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {passOverrideActive
                          ? '⚡ Single-use pass limits and device restriction locks are bypassed for test passes.'
                          : 'Enforces standard 1-use pass limits per test account & per device. Enable override to allow unlimited test logins.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleTogglePassLimitOverride}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md ${
                        passOverrideActive
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>{passOverrideActive ? 'Disable Pass Override' : 'Enable Pass Limit Override'}</span>
                    </button>

                    {devicePassBlocked && (
                      <button
                        onClick={handleResetDevicePassLock}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors"
                        title="Clear local browser test pass restriction flag"
                      >
                        Reset Device Restrictions
                      </button>
                    )}
                  </div>
                </div>

                {/* Custom Max Pass Limit Counter selector */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="font-bold text-amber-400">Max Passes Limit Per Device:</span>
                    <div className="flex items-center gap-1">
                      {[1, 3, 5, 10, 999].map((limitVal) => (
                        <button
                          key={limitVal}
                          onClick={() => handleUpdateMaxPassCount(limitVal)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                            passMaxCount === limitVal
                              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-sm'
                              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                          }`}
                        >
                          {limitVal === 999 ? '∞ Unlimited' : `${limitVal} Pass${limitVal > 1 ? 'es' : ''}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateTestPass}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Generate New Test Pass</span>
                    </button>

                    <button
                      onClick={handleResetTestAccounts}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-colors border border-slate-700"
                    >
                      Reset All Consumed Passes
                    </button>
                  </div>
                </div>
              </div>

              {/* VIP CONTROL SUITE BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-slate-900 border border-amber-500/50 shadow-xl space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-lg shadow-amber-500/10">
                      <Crown className="w-6 h-6 text-amber-400 animate-bounce" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                          <span>VIP Account Management Suite</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                            {usersList.filter((u) => u.isVip).length} VIP MEMBERS
                          </span>
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300">
                        Admin powers: Upgrade any regular account to VIP status, customize VIP tiers (Gold, Diamond, Platinum), promote all users, or create pre-configured VIP passes.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={handlePromoteAllToVip}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                      title="Grant VIP Gold Status to All Registered Accounts"
                    >
                      <Crown className="w-4 h-4 text-slate-950" />
                      <span>Promote All Users to VIP 👑</span>
                    </button>

                    <button
                      onClick={() => handleGenerateVipAccount('Gold')}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
                      title="Instantly generate a VIP Gold pass user"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>+ Gen VIP Gold</span>
                    </button>

                    <button
                      onClick={() => handleGenerateVipAccount('Diamond')}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
                      title="Instantly generate a VIP Diamond pass user"
                    >
                      <Crown className="w-3.5 h-3.5 text-cyan-400" />
                      <span>+ Gen Diamond</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions Header */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Search registered accounts by username, name, or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50 flex-1 min-w-[200px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      syncUsersWithServer().then(() => refreshData());
                      setUserMsg('🔄 Synced all registered accounts with server registry!');
                      setTimeout(() => setUserMsg(''), 3000);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                    title="Refresh user accounts database from backend server"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Live Sync</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowAddUserForm(!showAddUserForm)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{showAddUserForm ? 'Close Form' : 'Create User Account'}</span>
                </button>
              </div>

              {userMsg && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{userMsg}</span>
                </div>
              )}

              {/* Create User Form */}
              {showAddUserForm && (
                <form
                  onSubmit={handleCreateUser}
                  className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-4 shadow-xl"
                >
                  <h3 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Register New User Account</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        required
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="e.g. gamer_pro"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Full Name / Display Name
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Ishaan Y."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="e.g. user@example.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Password *
                      </label>
                      <input
                        type="text"
                        required
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Password..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserForm(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              )}

              {/* Users Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Username</th>
                        <th className="py-3 px-4">Full Name</th>
                        <th className="py-3 px-4">Points Balance</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">VIP Status</th>
                        <th className="py-3 px-4">Created Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {usersList
                        .filter(
                          (u) =>
                            !userSearch ||
                            u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                            (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
                            (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
                        )
                        .map((user) => {
                          const isPrimaryAdmin =
                            user.username.toLowerCase() === 'pebblesthepenguinishaany83';
                          return (
                            <tr key={user.username} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-extrabold text-white flex items-center gap-2">
                                  <span>{user.username}</span>
                                  {isPrimaryAdmin && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-black">
                                      Owner Admin
                                    </span>
                                  )}
                                  {user.isTestAccount && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black">
                                      🧪 TEST PASS
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className="font-semibold text-slate-200">
                                  {user.name || <span className="text-slate-600 font-normal italic">Not set</span>}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5 font-mono">
                                  <span className="font-extrabold text-amber-400">
                                    🪙 {user.points !== undefined ? user.points : 10}
                                  </span>
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      onClick={() => handleAdjustPoints(user.username, 100)}
                                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 font-mono font-bold"
                                      title="Add +100 Points"
                                    >
                                      +100
                                    </button>
                                    <button
                                      onClick={() => handleAdjustPoints(user.username, -100)}
                                      className="px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-rose-300 font-mono"
                                      title="Deduct 100 Points"
                                    >
                                      -100
                                    </button>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                {isPrimaryAdmin || user.isAdmin ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                                    Admin
                                  </span>
                                ) : user.isTestAccount ? (
                                  user.testAccountUsed ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                      Used (Consumed)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                      Available (1 Use)
                                    </span>
                                  )
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 text-[10px]">
                                    Member
                                  </span>
                                )}
                              </td>

                              {/* VIP Status Column */}
                              <td className="py-3 px-4">
                                {user.isVip ? (
                                  <div className="flex flex-col gap-1">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${
                                      user.vipLevel === 'Diamond'
                                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/50 shadow-cyan-500/20'
                                        : user.vipLevel === 'Platinum'
                                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/50 shadow-purple-500/20'
                                        : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/20'
                                    }`}>
                                      <Crown className="w-3 h-3 text-amber-400" />
                                      <span>VIP {user.vipLevel || 'Gold'}</span>
                                    </span>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700/60 text-[10px] font-semibold">
                                    Regular User
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-slate-400 text-[11px]">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>

                              <td className="py-3 px-4 text-slate-400 text-[11px]">
                                {new Date(user.lastLogin).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Edit Password Button / Form */}
                                  {editingUserPass === user.username ? (
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="text"
                                        placeholder="New pass..."
                                        value={newPasswordInput}
                                        onChange={(e) => setNewPasswordInput(e.target.value)}
                                        className="w-24 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white text-[11px]"
                                      />
                                      <button
                                        onClick={() => handleUpdatePassword(user.username)}
                                        className="px-2 py-1 rounded bg-amber-500 text-slate-950 text-[10px] font-bold"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingUserPass(null)}
                                        className="px-1.5 py-1 rounded bg-slate-800 text-slate-400 text-[10px]"
                                      >
                                        X
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingUserPass(user.username);
                                        setNewPasswordInput('');
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                                      title="Change Password"
                                    >
                                      <Key className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {user.isTestAccount && user.testAccountUsed && (
                                    <button
                                      onClick={() => handleResetAccountPassLock(user.username)}
                                      className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-colors"
                                      title="Reset 1-Use Pass Lock"
                                    >
                                      Unlock Pass
                                    </button>
                                  )}

                                  {/* Toggle VIP Button */}
                                  <button
                                    onClick={() => handleToggleVip(user.username, user.isVip)}
                                    className={`px-2 py-1 rounded-lg border text-[10px] font-black transition-all flex items-center gap-1 ${
                                      user.isVip
                                        ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-300 border-amber-500/50 shadow-xs'
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300 hover:border-amber-500/40'
                                    }`}
                                    title={user.isVip ? 'Revoke VIP status from this user' : 'Upgrade this account to VIP Gold status'}
                                  >
                                    <Crown className={`w-3 h-3 ${user.isVip ? 'text-amber-400' : 'text-slate-500'}`} />
                                    <span>{user.isVip ? 'VIP 👑' : 'Make VIP'}</span>
                                  </button>

                                  {/* Tier Selector Dropdown if VIP */}
                                  {user.isVip && (
                                    <select
                                      value={user.vipLevel || 'Gold'}
                                      onChange={(e) => handleSetVipLevel(user.username, e.target.value as any)}
                                      className="px-1.5 py-1 rounded bg-slate-950 border border-amber-500/40 text-amber-300 text-[10px] font-bold focus:outline-none"
                                      title="Change VIP Membership Tier"
                                    >
                                      <option value="Gold">Gold 👑</option>
                                      <option value="Diamond">Diamond 💎</option>
                                      <option value="Platinum">Platinum 🔮</option>
                                    </select>
                                  )}

                                  {!isPrimaryAdmin && (
                                    <>
                                      <button
                                        onClick={() => handleToggleAdmin(user.username)}
                                        className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-colors ${
                                          user.isAdmin
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                        }`}
                                        title="Toggle Admin Privilege"
                                      >
                                        {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                      </button>

                                      <button
                                        onClick={() => handleDeleteUser(user.username)}
                                        className="p-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
                                        title="Delete User"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM BACKUP & TOOLS */}
          {activeTab === 'tools' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Site Maintenance & Global System Settings */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-sm font-extrabold text-white">Global Platform Settings & Maintenance</h3>
                      <p className="text-xs text-slate-400">Configure site branding, maintenance mode, and visual effects</p>
                    </div>
                  </div>
                  {configSaved && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-bounce">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Settings Saved!</span>
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveSiteConfigSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">
                        Portal Brand Title
                      </label>
                      <input
                        type="text"
                        value={siteConfigState.siteTitle || 'GameLand'}
                        onChange={(e) => setSiteConfigState({ ...siteConfigState, siteTitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                        placeholder="GameLand"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-300 block mb-1">
                        Tagline / Subtitle
                      </label>
                      <input
                        type="text"
                        value={siteConfigState.tagline || ''}
                        onChange={(e) => setSiteConfigState({ ...siteConfigState, tagline: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                        placeholder="Play free online games!"
                      />
                    </div>
                  </div>

                  {/* Maintenance Mode Controls */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ban className={`w-4 h-4 ${siteConfigState.maintenanceMode ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                        <span className="font-bold text-slate-200">System Maintenance Mode</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSiteConfigState({
                            ...siteConfigState,
                            maintenanceMode: !siteConfigState.maintenanceMode,
                          })
                        }
                        className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                          siteConfigState.maintenanceMode
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {siteConfigState.maintenanceMode ? '🚨 MAINTENANCE ACTIVE' : 'Normal Operation'}
                      </button>
                    </div>

                    {siteConfigState.maintenanceMode && (
                      <div>
                        <label className="font-bold text-rose-300 block mb-1">
                          Maintenance Banner Message
                        </label>
                        <input
                          type="text"
                          value={siteConfigState.maintenanceMessage || 'Platform maintenance in progress. Games back online soon!'}
                          onChange={(e) =>
                            setSiteConfigState({
                              ...siteConfigState,
                              maintenanceMessage: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-rose-500/50 text-rose-200 text-xs focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Platform Settings</span>
                    </button>
                  </div>
                </form>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Database JSON Backup</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Export complete JSON snapshot of all games, custom entries, play counts, and user databases.
                </p>
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              {/* Data & Score Reset Controls Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>Data & Count Reset Controls (Admin Only)</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black uppercase">
                    ADMIN RESTRICTED
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Manage platform counters, reset play count totals to 0, or clear all leaderboard high score rankings back to baseline zero.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all play counts to 0 across all games?')) {
                        resetAllPlayCounts();
                        addAuditLog('games', 'Admin reset all play counts to 0');
                        refreshData();
                        onGamesUpdated();
                        setUserMsg('All game play counts reset to 0!');
                        setTimeout(() => setUserMsg(''), 3000);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-black transition-colors border border-amber-500/30 flex items-center gap-2 shadow-sm"
                    id="admin-reset-play-counts-btn"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset All Play Counts to 0</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset ALL high scores to 0 across all games on the platform?')) {
                        resetAllLeaderboardsToZero();
                        addAuditLog('system', 'Admin reset all game leaderboards & high scores to 0');
                        setUserMsg('All leaderboard high scores across all games have been reset to 0! 🏆');
                        refreshData();
                        setTimeout(() => setUserMsg(''), 4000);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-black transition-colors border border-rose-500/40 flex items-center gap-2 shadow-sm"
                    id="admin-reset-high-scores-btn"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reset ALL High Scores to 0</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Reset custom games and restore defaults?')) {
                        localStorage.removeItem('gameland_hidden_games_v1');
                        localStorage.removeItem('gameland_custom_games_v1');
                        addAuditLog('games', 'Admin reset custom game catalog');
                        refreshData();
                        onGamesUpdated();
                        setUserMsg('Custom game catalog restored to defaults!');
                        setTimeout(() => setUserMsg(''), 3000);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors border border-slate-700"
                    id="admin-reset-catalog-btn"
                  >
                    Reset Game Filters & Catalog
                  </button>
                </div>
              </div>

              {/* Test Accounts Admin Section */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-3">
                <h3 className="text-sm font-extrabold text-emerald-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Single-Use Test Accounts Administration</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Manage test account passes, reset single-use consumption flags, or create new 1-time test passes for testing.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={() => {
                      const newPass = generateNewTestPass();
                      refreshData();
                      alert(`Created new single-use test pass:\nUsername: ${newPass.username}\nPassword: ${newPass.passwordHash}`);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-2 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Generate New 1-Time Test Pass</span>
                  </button>

                  <button
                    onClick={() => {
                      resetAllTestAccountsAdmin();
                      refreshData();
                      alert('All test account passes have been reset to unused status!');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors border border-emerald-500/40"
                  >
                    Reset All Test Passes to Unused
                  </button>

                  <button
                    onClick={() => {
                      resetDeviceTestAccountFlag();
                      alert('Cleared local device test account lock. You can claim/use another test pass on this browser.');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors border border-slate-700"
                  >
                    Clear Browser 1-Use Device Lock
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: VIP PASS APPROVALS & MANUAL TIER GRANTER */}
          {activeTab === 'vip_approvals' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-yellow-950/50 to-slate-900 border-2 border-amber-500/60 shadow-xl space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black">
                    <Crown className="w-6 h-6 fill-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                      <span>VIP Pass Requests & Tier Fulfillment Station</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                        {pendingVipOrders.length} Pending Approval
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Approve user VIP pass requests, manually grant custom VIP tiers (Gold, Platinum, Diamond), or manage VIP permissions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pending Orders Queue */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Pending VIP Pass Orders ({pendingVipOrders.length})</span>
                </h4>

                {pendingVipOrders.length > 0 ? (
                  <div className="space-y-3">
                    {pendingVipOrders.map((ord) => (
                      <div
                        key={ord.username}
                        className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Crown className="w-6 h-6 text-amber-400" />
                          </div>
                          <div>
                            <div className="font-extrabold text-white text-xs flex items-center gap-2">
                              <span>User: {ord.username}</span>
                              {ord.name && <span className="text-slate-400">({ord.name})</span>}
                            </div>
                            <div className="text-[11px] text-amber-300 font-medium flex items-center gap-2 mt-0.5">
                              <span>Tier Requested: <strong className="uppercase text-amber-400 font-bold">{ord.pending.vipTier} VIP</strong></span>
                              <span>•</span>
                              <span>Points Paid: <strong className="font-mono text-amber-400">🪙 {ord.pending.price} PTS</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveVipOrder(ord.username)}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve & Grant VIP 👑</span>
                          </button>

                          <button
                            onClick={() => handleRejectVipOrder(ord.username)}
                            className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                          >
                            <span>Reject & Refund</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>All VIP pass orders are fulfilled. Queue is clean!</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Queue Status: Clear</span>
                  </div>
                )}
              </div>

              {/* Manual VIP Tier Granter / Override */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-amber-400" />
                    <span>Manual VIP Tier Granter & Override</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black">
                    ADMIN OVERRIDE
                  </span>
                </div>

                <form onSubmit={handleManualGrantVipTier} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Target Username:</label>
                    <input
                      type="text"
                      placeholder="Type username (e.g. GlacierGamer)..."
                      value={manualVipTargetUser}
                      onChange={(e) => setManualVipTargetUser(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Select VIP Tier:</label>
                    <select
                      value={manualVipTierSelect}
                      onChange={(e) => setManualVipTierSelect(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Gold">👑 Gold VIP (1.25x Multiplier)</option>
                      <option value="Platinum">💎 Platinum VIP (1.5x Multiplier)</option>
                      <option value="Diamond">⚡ Diamond VIP (2.0x Multiplier)</option>
                      <option value="None">🚫 Revoke VIP Status</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Crown className="w-4 h-4 fill-slate-950" />
                      <span>Grant VIP Tier Override</span>
                    </button>
                  </div>
                </form>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Bulk VIP Promotion Action:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Promote ALL registered user accounts to Gold VIP level?')) {
                        promoteAllUsersToVip();
                        addAuditLog('users', 'Promoted all registered users to VIP Gold');
                        setUserMsg('🎉 Promoted ALL users to Gold VIP!');
                        refreshData();
                        setTimeout(() => setUserMsg(''), 4000);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
                  >
                    <span>Promote ALL Accounts to VIP Gold 👑</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: DATABASE BACKUP & EXPORT STATION */}
          {activeTab === 'backup_export' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Banner Header */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/60 border border-cyan-500/40 shadow-xl space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>Database Backup, CSV Export & System Restore Station</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                        System v2.0
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Export full system data backups as JSON, generate CSV spreadsheet reports, or restore site databases from previous backups.
                    </p>
                  </div>
                </div>
              </div>

              {/* JSON Full Backup Download Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300">
                      <FolderDown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Full Platform JSON System Backup</h4>
                      <p className="text-xs text-slate-400">
                        Includes all accounts, points balances, custom games, VIP orders, game feedback, and audit logs.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportJsonBackup}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 shrink-0 active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full Backup JSON</span>
                  </button>
                </div>
              </div>

              {/* CSV Exporters Station Grid */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>CSV Spreadsheet Reports Exporters</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <h5 className="font-extrabold text-white text-xs flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span>User Accounts CSV</span>
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        Export user list with usernames, VIP status, points balances, and registered dates.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportUsersCsv}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-all border border-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Export Users CSV</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <h5 className="font-extrabold text-white text-xs flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                        <span>Game Feedback CSV</span>
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        Export player feedback entries, rating scores, comments, and point rewards granted.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportFeedbackCsv}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-all border border-cyan-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Export Feedback CSV</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <h5 className="font-extrabold text-white text-xs flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>Audit Logs CSV</span>
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        Export full security & administrative action audit logs history.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportAuditLogsCsv}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold transition-all border border-emerald-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export Audit Logs CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* JSON System Restore Station */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                      <Upload className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-amber-300">System Database Restore Engine</h4>
                      <p className="text-xs text-slate-400">
                        Restore account balances and site settings from a previously exported JSON backup file.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-dashed border-amber-500/40 text-center space-y-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJsonBackup}
                    className="hidden"
                    id="admin-restore-json-input"
                  />
                  <label
                    htmlFor="admin-restore-json-input"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer"
                  >
                    <Upload className="w-4 h-4 fill-slate-950" />
                    <span>Select & Upload JSON Backup File</span>
                  </label>
                  <p className="text-[11px] text-slate-500">Only upload verified GameLand backup .json files.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-300">
              Logged in as Pebbles Admin (Pebblesthepenguinishaany83)
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
