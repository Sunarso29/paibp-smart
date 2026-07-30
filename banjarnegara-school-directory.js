(() => {
  "use strict";
  const schools = [
  {
    "id": "bna-smp-001",
    "name": "SMP NEGERI 1 SUSUKAN",
    "district": "Susukan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-002",
    "name": "SMP NEGERI 2 SUSUKAN",
    "district": "Susukan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-003",
    "name": "SMP NEGERI 3 SUSUKAN",
    "district": "Susukan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-004",
    "name": "SMP NEGERI 4 SATAP SUSUKAN",
    "district": "Susukan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-005",
    "name": "SMP NEGERI 1 PURWAREJA - KLAMPOK",
    "district": "Purwareja Klampok",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-006",
    "name": "SMP NEGERI 2 PURWOREJO KLAMPOK",
    "district": "Purwareja Klampok",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-007",
    "name": "SMP NEGERI 3 PURWOREJO KLAMPOK",
    "district": "Purwareja Klampok",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-008",
    "name": "SMP NEGERI 1 MANDIRAJA",
    "district": "Mandiraja",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-009",
    "name": "SMP NEGERI 2 MANDIRAJA",
    "district": "Mandiraja",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-010",
    "name": "SMP NEGERI 3 MANDIRAJA",
    "district": "Mandiraja",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-011",
    "name": "SMP NEGERI 4 MANDIRAJA",
    "district": "Mandiraja",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-012",
    "name": "SMP NEGERI 1 PURWANEGARA",
    "district": "Purwanegara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-013",
    "name": "SMP NEGERI 2 PURWANEGARA",
    "district": "Purwanegara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-014",
    "name": "SMP NEGERI 3 PURWANEGARA",
    "district": "Purwanegara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-015",
    "name": "SMP NEGERI 4 PURWANEGARA",
    "district": "Purwanegara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-016",
    "name": "SMP NEGERI 5 SATAP PURWANEGARA",
    "district": "Purwanegara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-017",
    "name": "SMP NEGERI 6 SATAP PURWANEGARA",
    "district": "Purwanegara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-018",
    "name": "SMP NEGERI 1 BAWANG",
    "district": "Bawang",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-019",
    "name": "SMP NEGERI 2 BAWANG",
    "district": "Bawang",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-020",
    "name": "SMP NEGERI 3 BAWANG",
    "district": "Bawang",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-021",
    "name": "SMP NEGERI 4 SATU ATAP BAWANG",
    "district": "Bawang",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-022",
    "name": "SMP NEGERI 5 BAWANG",
    "district": "Bawang",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-023",
    "name": "SMP NEGERI 1 BANJARNEGARA",
    "district": "Banjarnegara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-024",
    "name": "SMP NEGERI 2 BANJARNEGARA",
    "district": "Banjarnegara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-025",
    "name": "SMP NEGERI 4 BANJARNEGARA",
    "district": "Banjarnegara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-026",
    "name": "SMP NEGERI 5 BANJARNEGARA",
    "district": "Banjarnegara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-027",
    "name": "SMP NEGERI 6 SATU ATAP BANJARNEGARA",
    "district": "Banjarnegara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-028",
    "name": "SMP NEGERI 1 SIGALUH",
    "district": "Sigaluh",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-029",
    "name": "SMP NEGERI 2 SATU ATAP SIGALUH",
    "district": "Sigaluh",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-030",
    "name": "SMP NEGERI 1 MADUKARA",
    "district": "Madukara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-031",
    "name": "SMP NEGERI 2 MADUKARA",
    "district": "Madukara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-032",
    "name": "SMP NEGERI 3 BANJARNEGARA",
    "district": "Madukara",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-033",
    "name": "SMP NEGERI 1 BANJARMANGU",
    "district": "Banjarmangu",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-034",
    "name": "SMP NEGERI 2 BANJARMANGU",
    "district": "Banjarmangu",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-035",
    "name": "SMP NEGERI 1 WANADADI",
    "district": "Wanadadi",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-036",
    "name": "SMP NEGERI 2 WANADADI",
    "district": "Wanadadi",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-037",
    "name": "SMP NEGERI 1 RAKIT",
    "district": "Rakit",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-038",
    "name": "SMP NEGERI 2 RAKIT",
    "district": "Rakit",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-039",
    "name": "SMP NEGERI 1 PUNGGELAN",
    "district": "Punggelan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-040",
    "name": "SMP NEGERI 2 PUNGGELAN",
    "district": "Punggelan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-041",
    "name": "SMP NEGERI 3 PUNGGELAN",
    "district": "Punggelan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-042",
    "name": "SMP NEGERI 4 PUNGGELAN",
    "district": "Punggelan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-043",
    "name": "SMP NEGERI 5 SATAP PUNGGELAN",
    "district": "Punggelan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-044",
    "name": "SMP NEGERI 6 SATAP PUNGGELAN",
    "district": "Punggelan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-045",
    "name": "SMP NEGERI 1 KARANGKOBAR",
    "district": "Karangkobar",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-046",
    "name": "SMP NEGERI 2 KARANGKOBAR",
    "district": "Karangkobar",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-047",
    "name": "SMP NEGERI 3 SATAP KARANGKOBAR",
    "district": "Karangkobar",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-048",
    "name": "SMP NEGERI 1 PAGENTAN",
    "district": "Pagentan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-049",
    "name": "SMP NEGERI 2 PAGENTAN",
    "district": "Pagentan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-050",
    "name": "SMP NEGERI 3 PAGENTAN",
    "district": "Pagentan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-051",
    "name": "SMP NEGERI 4 SATU ATAP PAGENTAN",
    "district": "Pagentan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-052",
    "name": "SMP NEGERI 5 PAGENTAN",
    "district": "Pagentan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-053",
    "name": "SMP NEGERI 1 PEJAWARAN",
    "district": "Pejawaran",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-054",
    "name": "SMP NEGERI 2 PEJAWARAN",
    "district": "Pejawaran",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-055",
    "name": "SMP NEGERI 3 SATAP PEJAWARAN",
    "district": "Pejawaran",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-056",
    "name": "SMP NEGERI 4 PEJAWARAN",
    "district": "Pejawaran",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-057",
    "name": "SMP NEGERI 1 BATUR",
    "district": "Batur",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-058",
    "name": "SMP NEGERI 2 BATUR",
    "district": "Batur",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-059",
    "name": "SMP NEGERI 1 WANAYASA",
    "district": "Wanayasa",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-060",
    "name": "SMP NEGERI 2 WANAYASA",
    "district": "Wanayasa",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-061",
    "name": "SMP NEGERI 3 WANAYASA",
    "district": "Wanayasa",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-062",
    "name": "SMP NEGERI 4 WANAYASA",
    "district": "Wanayasa",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-063",
    "name": "SMP NEGERI 1 KALIBENING",
    "district": "Kalibening",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-064",
    "name": "SMP NEGERI 2 KALIBENING",
    "district": "Kalibening",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-065",
    "name": "SMP NEGERI 3 KALIBENING",
    "district": "Kalibening",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-066",
    "name": "SMP NEGERI 4 KALIBENING",
    "district": "Kalibening",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-067",
    "name": "SMP NEGERI 5 SATU ATAP KALIBENING",
    "district": "Kalibening",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-068",
    "name": "SMP NEGERI 6 SATU ATAP KALIBENING",
    "district": "Kalibening",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-069",
    "name": "SMP NEGERI 1 PANDANARUM",
    "district": "Pandanarum",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-070",
    "name": "SMP NEGERI 2 SATU ATAP PANDANARUM",
    "district": "Pandanarum",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-071",
    "name": "SMP NEGERI 3 SATAP PANDANARUM",
    "district": "Pandanarum",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-072",
    "name": "SMP NEGERI 4 SATAP PANDANARUM",
    "district": "Pandanarum",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-073",
    "name": "SMP NEGERI 1 PAGEDONGAN",
    "district": "Pagedongan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-074",
    "name": "SMP NEGERI 2 SATU ATAP PAGEDONGAN",
    "district": "Pagedongan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-075",
    "name": "SMP NEGERI 3 PAGEDONGAN",
    "district": "Pagedongan",
    "status": "Negeri",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-076",
    "name": "SMP PGRI SUSUKAN",
    "district": "Susukan",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-077",
    "name": "SMP MUHAMMADIYAH PURWAREJA KLAMPOK",
    "district": "Purwareja Klampok",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-078",
    "name": "SMP PGRI PURWOREJO KLAMPOK",
    "district": "Purwareja Klampok",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-079",
    "name": "SMPIT MUTIARA HATI",
    "district": "Purwareja Klampok",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-080",
    "name": "SMP ISLAM PANGLEBURAN",
    "district": "Mandiraja",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-081",
    "name": "SMP NURUL AMBIYA MANDIRAJA",
    "district": "Mandiraja",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-082",
    "name": "SMP PLUS RIYADUL MUSTAQIM MANDIRAJA",
    "district": "Mandiraja",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-083",
    "name": "SMP AL QUR AN DAN DAKWAH ALAM BANJARNEGARA",
    "district": "Banjarnegara",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-084",
    "name": "SMP COKROAMINOTO BANJARNEGARA",
    "district": "Banjarnegara",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-085",
    "name": "SMP IP BILINGUAL SCHOOL TUNAS BANGSA",
    "district": "Banjarnegara",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-086",
    "name": "SMP ISLAM AL MUNAWWAROH",
    "district": "Banjarnegara",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-087",
    "name": "SMP MUHAMMADIYAH BANJARNEGARA",
    "district": "Banjarnegara",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-088",
    "name": "SMP TAMANSISWA BANJARNEGARA",
    "district": "Banjarnegara",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-089",
    "name": "SMP ISLAM SATRIA",
    "district": "Madukara",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-090",
    "name": "SMP ISLAM TERPADU PERMATA HATI BANJARNEGARA",
    "district": "Madukara",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-091",
    "name": "SMP COKROAMINOTO BANJARMANGU",
    "district": "Banjarmangu",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-092",
    "name": "SMP ISLAM DARUNAJAH",
    "district": "Banjarmangu",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-093",
    "name": "SMP COKROAMINOTO WANADADI",
    "district": "Wanadadi",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-094",
    "name": "SMP MUHAMMADIYAH WANADADI",
    "district": "Wanadadi",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-095",
    "name": "SMP TERBUKA WANADADI",
    "district": "Wanadadi",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-096",
    "name": "SMP MUHAMMADIYAH RAKIT",
    "district": "Rakit",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-097",
    "name": "SMP COKROAMINOTO PUNGGELAN",
    "district": "Punggelan",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-098",
    "name": "SMP MA ARIF NU 01 KARANGKOBAR",
    "district": "Karangkobar",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-099",
    "name": "SMP ISLAM AL MABRUR",
    "district": "Pagentan",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-100",
    "name": "SMP ISLAM AL MUBAROK",
    "district": "Kalibening",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  },
  {
    "id": "bna-smp-101",
    "name": "SMP COKROAMINOTO 1 PAGEDONGAN",
    "district": "Pagedongan",
    "status": "Swasta",
    "level": "SMP",
    "regency": "Kabupaten Banjarnegara",
    "province": "Jawa Tengah"
  }
];
  window.PAIBP_SCHOOL_DIRECTORY = {
    version: "2026.07",
    region: "Kabupaten Banjarnegara",
    sourceLabel: "SPMB Online SMP Kabupaten Banjarnegara — Dindikpora Kabupaten Banjarnegara",
    sourceUrl: "https://spmb.banjarnegarakab.go.id/home/pengumuman",
    schools,
  };
})();
