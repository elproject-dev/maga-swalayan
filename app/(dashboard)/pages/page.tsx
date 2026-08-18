"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LocationCombobox, LocationItem } from "@/components/location-combobox";

export default function PagesPage() {
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [regencies, setRegencies] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingRegencies, setIsLoadingRegencies] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Fetch Provinces on mount
  useEffect(() => {
    async function fetchProvinces() {
      setIsLoadingProvinces(true);
      try {
        const res = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
        const data = await res.json();
        setProvinces(data);
      } catch (error) {
        console.error("Failed to fetch provinces", error);
      } finally {
        setIsLoadingProvinces(false);
      }
    }
    fetchProvinces();
  }, []);

  // Fetch Regencies when Province changes
  useEffect(() => {
    if (!selectedProvince) {
      setRegencies([]);
      setSelectedRegency("");
      return;
    }
    async function fetchRegencies() {
      setIsLoadingRegencies(true);
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvince}.json`);
        const data = await res.json();
        setRegencies(data);
      } catch (error) {
        console.error("Failed to fetch regencies", error);
      } finally {
        setIsLoadingRegencies(false);
      }
    }
    fetchRegencies();
  }, [selectedProvince]);

  // Fetch Districts when Regency changes
  useEffect(() => {
    if (!selectedRegency) {
      setDistricts([]);
      setSelectedDistrict("");
      return;
    }
    async function fetchDistricts() {
      setIsLoadingDistricts(true);
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedRegency}.json`);
        const data = await res.json();
        setDistricts(data);
      } catch (error) {
        console.error("Failed to fetch districts", error);
      } finally {
        setIsLoadingDistricts(false);
      }
    }
    fetchDistricts();
  }, [selectedRegency]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Formulir Data</h2>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Data Pribadi</CardTitle>
            <CardDescription>
              Silakan isi formulir di bawah ini dengan lengkap.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input id="nama" placeholder="Masukkan nama lengkap Anda" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <textarea
                id="alamat"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Masukkan alamat lengkap Anda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telp">No. Telepon / WhatsApp</Label>
              <Input id="telp" type="tel" placeholder="Contoh: 081234567890" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Provinsi</Label>
                <LocationCombobox
                  value={selectedProvince}
                  onChange={(val) => setSelectedProvince(val)}
                  items={provinces}
                  isLoading={isLoadingProvinces}
                  placeholder="Pilih Provinsi..."
                  searchPlaceholder="Cari provinsi..."
                />
              </div>

              <div className="space-y-2">
                <Label>Kabupaten / Kota</Label>
                <LocationCombobox
                  value={selectedRegency}
                  onChange={(val) => setSelectedRegency(val)}
                  items={regencies}
                  isLoading={isLoadingRegencies}
                  placeholder="Pilih Kabupaten/Kota..."
                  searchPlaceholder="Cari kabupaten..."
                  disabled={!selectedProvince}
                />
              </div>

              <div className="space-y-2">
                <Label>Kecamatan</Label>
                <LocationCombobox
                  value={selectedDistrict}
                  onChange={(val) => setSelectedDistrict(val)}
                  items={districts}
                  isLoading={isLoadingDistricts}
                  placeholder="Pilih Kecamatan..."
                  searchPlaceholder="Cari kecamatan..."
                  disabled={!selectedRegency}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full sm:w-auto">Simpan Data</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
