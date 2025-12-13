"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Download, Upload, Loader2, CheckCircle2, AlertCircle, Clock, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BackupFile {
  name: string
  url: string
  size: number
  createdAt: string
}

export default function BackupRestorePage() {
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [deletingBackup, setDeletingBackup] = useState<string | null>(null)
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([])
  const [isLoadingBackups, setIsLoadingBackups] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const savedAutoBackup = localStorage.getItem("autoBackupEnabled")
    if (savedAutoBackup === "true") {
      setAutoBackupEnabled(true)
    }
    loadBackupFiles()
  }, [])

  const loadBackupFiles = async () => {
    try {
      setIsLoadingBackups(true)
      const response = await fetch("/api/admin/backups/list")
      if (response.ok) {
        const data = await response.json()
        setBackupFiles(data.backups || [])
      }
    } catch (error) {
      console.error("Error loading backups:", error)
    } finally {
      setIsLoadingBackups(false)
    }
  }

  const handleAutoBackupToggle = async (enabled: boolean) => {
    setAutoBackupEnabled(enabled)
    localStorage.setItem("autoBackupEnabled", enabled.toString())

    try {
      const response = await fetch("/api/admin/backups/auto-backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      })

      if (response.ok) {
        toast({
          title: enabled ? "Auto-backup enabled" : "Auto-backup disabled",
          description: enabled
            ? "Database will be backed up automatically at 12:00 AM daily"
            : "Auto-backup has been disabled",
        })
      }
    } catch (error) {
      console.error("Error updating auto-backup:", error)
      toast({
        title: "Error",
        description: "Failed to update auto-backup setting",
        variant: "destructive",
      })
    }
  }

  const handleManualBackup = async () => {
    setIsBackingUp(true)
    try {
      const response = await fetch("/api/admin/backups/create", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Backup created successfully",
          description: `Backup file: ${data.filename}`,
        })
        await loadBackupFiles()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Backup failed")
      }
    } catch (error) {
      console.error("Error creating backup:", error)
      toast({
        title: "Backup failed",
        description: error instanceof Error ? error.message : "Failed to create backup",
        variant: "destructive",
      })
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestore = async (backupFile: BackupFile) => {
    if (!confirm(`Are you sure you want to restore from "${backupFile.name}"? This will overwrite all current data.`)) {
      return
    }

    setIsRestoring(true)
    try {
      const response = await fetch("/api/admin/backups/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupUrl: backupFile.url }),
      })

      if (response.ok) {
        toast({
          title: "Restore completed successfully",
          description: "Database has been restored from the backup",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Restore failed")
      }
    } catch (error) {
      console.error("Error restoring backup:", error)
      toast({
        title: "Restore failed",
        description: error instanceof Error ? error.message : "Failed to restore backup",
        variant: "destructive",
      })
    } finally {
      setIsRestoring(false)
    }
  }

  const handleDownloadBackup = async (backupFile: BackupFile) => {
    try {
      const response = await fetch(backupFile.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = backupFile.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: `Downloading ${backupFile.name}`,
      })
    } catch (error) {
      console.error("Error downloading backup:", error)
      toast({
        title: "Download failed",
        description: "Failed to download backup file",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (backupFile: BackupFile) => {
    if (!confirm(`Are you sure you want to delete "${backupFile.name}"? This action cannot be undone.`)) {
      return
    }

    setDeletingBackup(backupFile.name)
    try {
      const response = await fetch("/api/admin/backups/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupUrl: backupFile.url }),
      })

      if (response.ok) {
        toast({
          title: "Backup deleted successfully",
          description: `${backupFile.name} has been removed`,
        })
        await loadBackupFiles()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Delete failed")
      }
    } catch (error) {
      console.error("Error deleting backup:", error)
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete backup",
        variant: "destructive",
      })
    } finally {
      setDeletingBackup(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Backup & Restore</h1>
        <p className="mt-2 text-gray-600">Manage database backups and restore points</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Auto Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Automatic Backup
            </CardTitle>
            <CardDescription>Schedule automatic database backups at 12:00 AM daily</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-backup" className="text-base">
                Enable Auto-Backup
              </Label>
              <Switch id="auto-backup" checked={autoBackupEnabled} onCheckedChange={handleAutoBackupToggle} />
            </div>

            {autoBackupEnabled && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Auto-backup is enabled. Your database will be backed up automatically every day at 12:00 AM midnight.
                </AlertDescription>
              </Alert>
            )}

            {!autoBackupEnabled && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Auto-backup is disabled. Enable it to automatically back up your database daily.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Manual Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Manual Backup
            </CardTitle>
            <CardDescription>Create a backup of your database instantly</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleManualBackup} disabled={isBackingUp} className="w-full">
              {isBackingUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Create Backup Now
                </>
              )}
            </Button>
            <p className="mt-4 text-sm text-gray-600">
              Creates an immediate backup of all database tables including appointments, customers, inventory, and more.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backup Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Backups</CardTitle>
          <CardDescription>View and restore from previous database backups</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBackups ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : backupFiles.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Database className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No backups available yet</p>
              <p className="text-sm">Create your first backup to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backupFiles.map((backup) => (
                <div
                  key={backup.name}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{backup.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(backup.createdAt)} • {formatFileSize(backup.size)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDownloadBackup(backup)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="default" size="sm" onClick={() => handleRestore(backup)} disabled={isRestoring}>
                      {isRestoring ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Restoring...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Restore
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(backup)}
                      disabled={deletingBackup === backup.name}
                    >
                      {deletingBackup === backup.name ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
