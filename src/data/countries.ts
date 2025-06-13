// ✅ packages/flowise-embed/src/data/countries.ts - Complete with 200+ countries

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const countries: Country[] = [
  // Americas
  { name: 'United States', code: 'US', dialCode: '+1', flag: 'https://flagcdn.com/w20/us.png' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: 'https://flagcdn.com/w20/ca.png' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: 'https://flagcdn.com/w20/mx.png' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: 'https://flagcdn.com/w20/br.png' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: 'https://flagcdn.com/w20/ar.png' },
  { name: 'Chile', code: 'CL', dialCode: '+56', flag: 'https://flagcdn.com/w20/cl.png' },
  { name: 'Colombia', code: 'CO', dialCode: '+57', flag: 'https://flagcdn.com/w20/co.png' },
  { name: 'Peru', code: 'PE', dialCode: '+51', flag: 'https://flagcdn.com/w20/pe.png' },
  { name: 'Venezuela', code: 'VE', dialCode: '+58', flag: 'https://flagcdn.com/w20/ve.png' },
  { name: 'Ecuador', code: 'EC', dialCode: '+593', flag: 'https://flagcdn.com/w20/ec.png' },
  { name: 'Uruguay', code: 'UY', dialCode: '+598', flag: 'https://flagcdn.com/w20/uy.png' },
  { name: 'Paraguay', code: 'PY', dialCode: '+595', flag: 'https://flagcdn.com/w20/py.png' },
  { name: 'Bolivia', code: 'BO', dialCode: '+591', flag: 'https://flagcdn.com/w20/bo.png' },
  { name: 'Guatemala', code: 'GT', dialCode: '+502', flag: 'https://flagcdn.com/w20/gt.png' },
  { name: 'Costa Rica', code: 'CR', dialCode: '+506', flag: 'https://flagcdn.com/w20/cr.png' },
  { name: 'Panama', code: 'PA', dialCode: '+507', flag: 'https://flagcdn.com/w20/pa.png' },
  { name: 'Nicaragua', code: 'NI', dialCode: '+505', flag: 'https://flagcdn.com/w20/ni.png' },
  { name: 'Honduras', code: 'HN', dialCode: '+504', flag: 'https://flagcdn.com/w20/hn.png' },
  { name: 'El Salvador', code: 'SV', dialCode: '+503', flag: 'https://flagcdn.com/w20/sv.png' },
  { name: 'Belize', code: 'BZ', dialCode: '+501', flag: 'https://flagcdn.com/w20/bz.png' },
  { name: 'Jamaica', code: 'JM', dialCode: '+1876', flag: 'https://flagcdn.com/w20/jm.png' },
  { name: 'Trinidad and Tobago', code: 'TT', dialCode: '+1868', flag: 'https://flagcdn.com/w20/tt.png' },
  { name: 'Barbados', code: 'BB', dialCode: '+1246', flag: 'https://flagcdn.com/w20/bb.png' },
  { name: 'Dominican Republic', code: 'DO', dialCode: '+1849', flag: 'https://flagcdn.com/w20/do.png' },
  { name: 'Cuba', code: 'CU', dialCode: '+53', flag: 'https://flagcdn.com/w20/cu.png' },
  { name: 'Haiti', code: 'HT', dialCode: '+509', flag: 'https://flagcdn.com/w20/ht.png' },
  { name: 'Puerto Rico', code: 'PR', dialCode: '+1787', flag: 'https://flagcdn.com/w20/pr.png' },
  { name: 'Antigua and Barbuda', code: 'AG', dialCode: '+1268', flag: 'https://flagcdn.com/w20/ag.png' },
  { name: 'Bahamas', code: 'BS', dialCode: '+1242', flag: 'https://flagcdn.com/w20/bs.png' },
  { name: 'Dominica', code: 'DM', dialCode: '+1767', flag: 'https://flagcdn.com/w20/dm.png' },
  { name: 'Grenada', code: 'GD', dialCode: '+1473', flag: 'https://flagcdn.com/w20/gd.png' },
  { name: 'Saint Kitts and Nevis', code: 'KN', dialCode: '+1869', flag: 'https://flagcdn.com/w20/kn.png' },
  { name: 'Saint Lucia', code: 'LC', dialCode: '+1758', flag: 'https://flagcdn.com/w20/lc.png' },
  { name: 'Saint Vincent and the Grenadines', code: 'VC', dialCode: '+1784', flag: 'https://flagcdn.com/w20/vc.png' },
  { name: 'Suriname', code: 'SR', dialCode: '+597', flag: 'https://flagcdn.com/w20/sr.png' },
  { name: 'Guyana', code: 'GY', dialCode: '+592', flag: 'https://flagcdn.com/w20/gy.png' },
  { name: 'French Guiana', code: 'GF', dialCode: '+594', flag: 'https://flagcdn.com/w20/gf.png' },

  // Europe
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: 'https://flagcdn.com/w20/gb.png' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: 'https://flagcdn.com/w20/de.png' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: 'https://flagcdn.com/w20/fr.png' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: 'https://flagcdn.com/w20/it.png' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: 'https://flagcdn.com/w20/es.png' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: 'https://flagcdn.com/w20/nl.png' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: 'https://flagcdn.com/w20/be.png' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: 'https://flagcdn.com/w20/ch.png' },
  { name: 'Austria', code: 'AT', dialCode: '+43', flag: 'https://flagcdn.com/w20/at.png' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: 'https://flagcdn.com/w20/pt.png' },
  { name: 'Greece', code: 'GR', dialCode: '+30', flag: 'https://flagcdn.com/w20/gr.png' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: 'https://flagcdn.com/w20/tr.png' },
  { name: 'Poland', code: 'PL', dialCode: '+48', flag: 'https://flagcdn.com/w20/pl.png' },
  { name: 'Czech Republic', code: 'CZ', dialCode: '+420', flag: 'https://flagcdn.com/w20/cz.png' },
  { name: 'Hungary', code: 'HU', dialCode: '+36', flag: 'https://flagcdn.com/w20/hu.png' },
  { name: 'Slovakia', code: 'SK', dialCode: '+421', flag: 'https://flagcdn.com/w20/sk.png' },
  { name: 'Slovenia', code: 'SI', dialCode: '+386', flag: 'https://flagcdn.com/w20/si.png' },
  { name: 'Croatia', code: 'HR', dialCode: '+385', flag: 'https://flagcdn.com/w20/hr.png' },
  { name: 'Serbia', code: 'RS', dialCode: '+381', flag: 'https://flagcdn.com/w20/rs.png' },
  { name: 'Bosnia and Herzegovina', code: 'BA', dialCode: '+387', flag: 'https://flagcdn.com/w20/ba.png' },
  { name: 'Montenegro', code: 'ME', dialCode: '+382', flag: 'https://flagcdn.com/w20/me.png' },
  { name: 'North Macedonia', code: 'MK', dialCode: '+389', flag: 'https://flagcdn.com/w20/mk.png' },
  { name: 'Albania', code: 'AL', dialCode: '+355', flag: 'https://flagcdn.com/w20/al.png' },
  { name: 'Bulgaria', code: 'BG', dialCode: '+359', flag: 'https://flagcdn.com/w20/bg.png' },
  { name: 'Romania', code: 'RO', dialCode: '+40', flag: 'https://flagcdn.com/w20/ro.png' },
  { name: 'Moldova', code: 'MD', dialCode: '+373', flag: 'https://flagcdn.com/w20/md.png' },
  { name: 'Ukraine', code: 'UA', dialCode: '+380', flag: 'https://flagcdn.com/w20/ua.png' },
  { name: 'Belarus', code: 'BY', dialCode: '+375', flag: 'https://flagcdn.com/w20/by.png' },
  { name: 'Lithuania', code: 'LT', dialCode: '+370', flag: 'https://flagcdn.com/w20/lt.png' },
  { name: 'Latvia', code: 'LV', dialCode: '+371', flag: 'https://flagcdn.com/w20/lv.png' },
  { name: 'Estonia', code: 'EE', dialCode: '+372', flag: 'https://flagcdn.com/w20/ee.png' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: 'https://flagcdn.com/w20/fi.png' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: 'https://flagcdn.com/w20/se.png' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: 'https://flagcdn.com/w20/no.png' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: 'https://flagcdn.com/w20/dk.png' },
  { name: 'Iceland', code: 'IS', dialCode: '+354', flag: 'https://flagcdn.com/w20/is.png' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: 'https://flagcdn.com/w20/ie.png' },
  { name: 'Luxembourg', code: 'LU', dialCode: '+352', flag: 'https://flagcdn.com/w20/lu.png' },
  { name: 'Malta', code: 'MT', dialCode: '+356', flag: 'https://flagcdn.com/w20/mt.png' },
  { name: 'Cyprus', code: 'CY', dialCode: '+357', flag: 'https://flagcdn.com/w20/cy.png' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: 'https://flagcdn.com/w20/ru.png' },
  { name: 'Monaco', code: 'MC', dialCode: '+377', flag: 'https://flagcdn.com/w20/mc.png' },
  { name: 'San Marino', code: 'SM', dialCode: '+378', flag: 'https://flagcdn.com/w20/sm.png' },
  { name: 'Vatican City', code: 'VA', dialCode: '+379', flag: 'https://flagcdn.com/w20/va.png' },
  { name: 'Andorra', code: 'AD', dialCode: '+376', flag: 'https://flagcdn.com/w20/ad.png' },
  { name: 'Liechtenstein', code: 'LI', dialCode: '+423', flag: 'https://flagcdn.com/w20/li.png' },

  // Asia
  { name: 'China', code: 'CN', dialCode: '+86', flag: 'https://flagcdn.com/w20/cn.png' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: 'https://flagcdn.com/w20/jp.png' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: 'https://flagcdn.com/w20/kr.png' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: 'https://flagcdn.com/w20/in.png' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: 'https://flagcdn.com/w20/pk.png' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: 'https://flagcdn.com/w20/bd.png' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: 'https://flagcdn.com/w20/lk.png' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: 'https://flagcdn.com/w20/np.png' },
  { name: 'Bhutan', code: 'BT', dialCode: '+975', flag: 'https://flagcdn.com/w20/bt.png' },
  { name: 'Maldives', code: 'MV', dialCode: '+960', flag: 'https://flagcdn.com/w20/mv.png' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: 'https://flagcdn.com/w20/th.png' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: 'https://flagcdn.com/w20/vn.png' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: 'https://flagcdn.com/w20/sg.png' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: 'https://flagcdn.com/w20/my.png' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: 'https://flagcdn.com/w20/id.png' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: 'https://flagcdn.com/w20/ph.png' },
  { name: 'Brunei', code: 'BN', dialCode: '+673', flag: 'https://flagcdn.com/w20/bn.png' },
  { name: 'Cambodia', code: 'KH', dialCode: '+855', flag: 'https://flagcdn.com/w20/kh.png' },
  { name: 'Laos', code: 'LA', dialCode: '+856', flag: 'https://flagcdn.com/w20/la.png' },
  { name: 'Myanmar', code: 'MM', dialCode: '+95', flag: 'https://flagcdn.com/w20/mm.png' },
  { name: 'Taiwan', code: 'TW', dialCode: '+886', flag: 'https://flagcdn.com/w20/tw.png' },
  { name: 'Hong Kong', code: 'HK', dialCode: '+852', flag: 'https://flagcdn.com/w20/hk.png' },
  { name: 'Macau', code: 'MO', dialCode: '+853', flag: 'https://flagcdn.com/w20/mo.png' },
  { name: 'Mongolia', code: 'MN', dialCode: '+976', flag: 'https://flagcdn.com/w20/mn.png' },
  { name: 'North Korea', code: 'KP', dialCode: '+850', flag: 'https://flagcdn.com/w20/kp.png' },
  { name: 'Kazakhstan', code: 'KZ', dialCode: '+7', flag: 'https://flagcdn.com/w20/kz.png' },
  { name: 'Uzbekistan', code: 'UZ', dialCode: '+998', flag: 'https://flagcdn.com/w20/uz.png' },
  { name: 'Turkmenistan', code: 'TM', dialCode: '+993', flag: 'https://flagcdn.com/w20/tm.png' },
  { name: 'Tajikistan', code: 'TJ', dialCode: '+992', flag: 'https://flagcdn.com/w20/tj.png' },
  { name: 'Kyrgyzstan', code: 'KG', dialCode: '+996', flag: 'https://flagcdn.com/w20/kg.png' },
  { name: 'Afghanistan', code: 'AF', dialCode: '+93', flag: 'https://flagcdn.com/w20/af.png' },
  { name: 'Iran', code: 'IR', dialCode: '+98', flag: 'https://flagcdn.com/w20/ir.png' },
  { name: 'Iraq', code: 'IQ', dialCode: '+964', flag: 'https://flagcdn.com/w20/iq.png' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: 'https://flagcdn.com/w20/sa.png' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: 'https://flagcdn.com/w20/ae.png' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: 'https://flagcdn.com/w20/qa.png' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: 'https://flagcdn.com/w20/kw.png' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: 'https://flagcdn.com/w20/bh.png' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: 'https://flagcdn.com/w20/om.png' },
  { name: 'Yemen', code: 'YE', dialCode: '+967', flag: 'https://flagcdn.com/w20/ye.png' },
  { name: 'Jordan', code: 'JO', dialCode: '+962', flag: 'https://flagcdn.com/w20/jo.png' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961', flag: 'https://flagcdn.com/w20/lb.png' },
  { name: 'Syria', code: 'SY', dialCode: '+963', flag: 'https://flagcdn.com/w20/sy.png' },
  { name: 'Israel', code: 'IL', dialCode: '+972', flag: 'https://flagcdn.com/w20/il.png' },
  { name: 'Palestine', code: 'PS', dialCode: '+970', flag: 'https://flagcdn.com/w20/ps.png' },
  { name: 'Armenia', code: 'AM', dialCode: '+374', flag: 'https://flagcdn.com/w20/am.png' },
  { name: 'Azerbaijan', code: 'AZ', dialCode: '+994', flag: 'https://flagcdn.com/w20/az.png' },
  { name: 'Georgia', code: 'GE', dialCode: '+995', flag: 'https://flagcdn.com/w20/ge.png' },
  { name: 'East Timor', code: 'TL', dialCode: '+670', flag: 'https://flagcdn.com/w20/tl.png' },

  // Africa
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: 'https://flagcdn.com/w20/za.png' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: 'https://flagcdn.com/w20/ng.png' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: 'https://flagcdn.com/w20/eg.png' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: 'https://flagcdn.com/w20/ke.png' },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: 'https://flagcdn.com/w20/gh.png' },
  { name: 'Morocco', code: 'MA', dialCode: '+212', flag: 'https://flagcdn.com/w20/ma.png' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216', flag: 'https://flagcdn.com/w20/tn.png' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213', flag: 'https://flagcdn.com/w20/dz.png' },
  { name: 'Libya', code: 'LY', dialCode: '+218', flag: 'https://flagcdn.com/w20/ly.png' },
  { name: 'Sudan', code: 'SD', dialCode: '+249', flag: 'https://flagcdn.com/w20/sd.png' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251', flag: 'https://flagcdn.com/w20/et.png' },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255', flag: 'https://flagcdn.com/w20/tz.png' },
  { name: 'Uganda', code: 'UG', dialCode: '+256', flag: 'https://flagcdn.com/w20/ug.png' },
  { name: 'Rwanda', code: 'RW', dialCode: '+250', flag: 'https://flagcdn.com/w20/rw.png' },
  { name: 'Zambia', code: 'ZM', dialCode: '+260', flag: 'https://flagcdn.com/w20/zm.png' },
  { name: 'Zimbabwe', code: 'ZW', dialCode: '+263', flag: 'https://flagcdn.com/w20/zw.png' },
  { name: 'Botswana', code: 'BW', dialCode: '+267', flag: 'https://flagcdn.com/w20/bw.png' },
  { name: 'Namibia', code: 'NA', dialCode: '+264', flag: 'https://flagcdn.com/w20/na.png' },
  { name: 'Mozambique', code: 'MZ', dialCode: '+258', flag: 'https://flagcdn.com/w20/mz.png' },
  { name: 'Madagascar', code: 'MG', dialCode: '+261', flag: 'https://flagcdn.com/w20/mg.png' },
  { name: 'Mauritius', code: 'MU', dialCode: '+230', flag: 'https://flagcdn.com/w20/mu.png' },
  { name: 'Seychelles', code: 'SC', dialCode: '+248', flag: 'https://flagcdn.com/w20/sc.png' },
  { name: 'Ivory Coast', code: 'CI', dialCode: '+225', flag: 'https://flagcdn.com/w20/ci.png' },
  { name: 'Senegal', code: 'SN', dialCode: '+221', flag: 'https://flagcdn.com/w20/sn.png' },
  { name: 'Mali', code: 'ML', dialCode: '+223', flag: 'https://flagcdn.com/w20/ml.png' },
  { name: 'Burkina Faso', code: 'BF', dialCode: '+226', flag: 'https://flagcdn.com/w20/bf.png' },
  { name: 'Niger', code: 'NE', dialCode: '+227', flag: 'https://flagcdn.com/w20/ne.png' },
  { name: 'Chad', code: 'TD', dialCode: '+235', flag: 'https://flagcdn.com/w20/td.png' },
  { name: 'Cameroon', code: 'CM', dialCode: '+237', flag: 'https://flagcdn.com/w20/cm.png' },
  { name: 'Central African Republic', code: 'CF', dialCode: '+236', flag: 'https://flagcdn.com/w20/cf.png' },
  { name: 'Gabon', code: 'GA', dialCode: '+241', flag: 'https://flagcdn.com/w20/ga.png' },
  { name: 'Republic of the Congo', code: 'CG', dialCode: '+242', flag: 'https://flagcdn.com/w20/cg.png' },
  { name: 'Democratic Republic of the Congo', code: 'CD', dialCode: '+243', flag: 'https://flagcdn.com/w20/cd.png' },
  { name: 'Angola', code: 'AO', dialCode: '+244', flag: 'https://flagcdn.com/w20/ao.png' },
  { name: 'Guinea', code: 'GN', dialCode: '+224', flag: 'https://flagcdn.com/w20/gn.png' },
  { name: 'Guinea-Bissau', code: 'GW', dialCode: '+245', flag: 'https://flagcdn.com/w20/gw.png' },
  { name: 'Sierra Leone', code: 'SL', dialCode: '+232', flag: 'https://flagcdn.com/w20/sl.png' },
  { name: 'Liberia', code: 'LR', dialCode: '+231', flag: 'https://flagcdn.com/w20/lr.png' },
  { name: 'Togo', code: 'TG', dialCode: '+228', flag: 'https://flagcdn.com/w20/tg.png' },
  { name: 'Benin', code: 'BJ', dialCode: '+229', flag: 'https://flagcdn.com/w20/bj.png' },
  { name: 'Mauritania', code: 'MR', dialCode: '+222', flag: 'https://flagcdn.com/w20/mr.png' },
  { name: 'Gambia', code: 'GM', dialCode: '+220', flag: 'https://flagcdn.com/w20/gm.png' },
  { name: 'Cape Verde', code: 'CV', dialCode: '+238', flag: 'https://flagcdn.com/w20/cv.png' },
  { name: 'São Tomé and Príncipe', code: 'ST', dialCode: '+239', flag: 'https://flagcdn.com/w20/st.png' },
  { name: 'Equatorial Guinea', code: 'GQ', dialCode: '+240', flag: 'https://flagcdn.com/w20/gq.png' },
  { name: 'Djibouti', code: 'DJ', dialCode: '+253', flag: 'https://flagcdn.com/w20/dj.png' },
  { name: 'Somalia', code: 'SO', dialCode: '+252', flag: 'https://flagcdn.com/w20/so.png' },
  { name: 'Eritrea', code: 'ER', dialCode: '+291', flag: 'https://flagcdn.com/w20/er.png' },
  { name: 'South Sudan', code: 'SS', dialCode: '+211', flag: 'https://flagcdn.com/w20/ss.png' },
  { name: 'Burundi', code: 'BI', dialCode: '+257', flag: 'https://flagcdn.com/w20/bi.png' },
  { name: 'Malawi', code: 'MW', dialCode: '+265', flag: 'https://flagcdn.com/w20/mw.png' },
  { name: 'Lesotho', code: 'LS', dialCode: '+266', flag: 'https://flagcdn.com/w20/ls.png' },
  { name: 'Eswatini', code: 'SZ', dialCode: '+268', flag: 'https://flagcdn.com/w20/sz.png' },
  { name: 'Comoros', code: 'KM', dialCode: '+269', flag: 'https://flagcdn.com/w20/km.png' },

  // Oceania
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: 'https://flagcdn.com/w20/au.png' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: 'https://flagcdn.com/w20/nz.png' },
  { name: 'Fiji', code: 'FJ', dialCode: '+679', flag: 'https://flagcdn.com/w20/fj.png' },
  { name: 'Papua New Guinea', code: 'PG', dialCode: '+675', flag: 'https://flagcdn.com/w20/pg.png' },
  { name: 'Solomon Islands', code: 'SB', dialCode: '+677', flag: 'https://flagcdn.com/w20/sb.png' },
  { name: 'Vanuatu', code: 'VU', dialCode: '+678', flag: 'https://flagcdn.com/w20/vu.png' },
  { name: 'New Caledonia', code: 'NC', dialCode: '+687', flag: 'https://flagcdn.com/w20/nc.png' },
  { name: 'French Polynesia', code: 'PF', dialCode: '+689', flag: 'https://flagcdn.com/w20/pf.png' },
  { name: 'Samoa', code: 'WS', dialCode: '+685', flag: 'https://flagcdn.com/w20/ws.png' },
  { name: 'Tonga', code: 'TO', dialCode: '+676', flag: 'https://flagcdn.com/w20/to.png' },
  { name: 'Kiribati', code: 'KI', dialCode: '+686', flag: 'https://flagcdn.com/w20/ki.png' },
  { name: 'Tuvalu', code: 'TV', dialCode: '+688', flag: 'https://flagcdn.com/w20/tv.png' },
  { name: 'Nauru', code: 'NR', dialCode: '+674', flag: 'https://flagcdn.com/w20/nr.png' },
  { name: 'Palau', code: 'PW', dialCode: '+680', flag: 'https://flagcdn.com/w20/pw.png' },
  { name: 'Marshall Islands', code: 'MH', dialCode: '+692', flag: 'https://flagcdn.com/w20/mh.png' },
  { name: 'Micronesia', code: 'FM', dialCode: '+691', flag: 'https://flagcdn.com/w20/fm.png' },
  { name: 'Northern Mariana Islands', code: 'MP', dialCode: '+1670', flag: 'https://flagcdn.com/w20/mp.png' },
  { name: 'Guam', code: 'GU', dialCode: '+1671', flag: 'https://flagcdn.com/w20/gu.png' },
  { name: 'American Samoa', code: 'AS', dialCode: '+1684', flag: 'https://flagcdn.com/w20/as.png' },
  { name: 'Cook Islands', code: 'CK', dialCode: '+682', flag: 'https://flagcdn.com/w20/ck.png' },
  { name: 'Niue', code: 'NU', dialCode: '+683', flag: 'https://flagcdn.com/w20/nu.png' },
  { name: 'Tokelau', code: 'TK', dialCode: '+690', flag: 'https://flagcdn.com/w20/tk.png' },
  { name: 'Wallis and Futuna', code: 'WF', dialCode: '+681', flag: 'https://flagcdn.com/w20/wf.png' },
];

// ✅ Helper functions
export const getCountryByCode = (code: string): Country | undefined => 
  countries.find(c => c.code === code);

export const getCountryByDialCode = (dialCode: string): Country | undefined => 
  countries.find(c => c.dialCode === dialCode);

export const formatPhoneNumber = (phoneNumber: string, country: Country): string => {
  if (!phoneNumber) return '';
  
  // Remove any existing country code
  let cleanNumber = phoneNumber.replace(/^\+/, '').replace(/^0+/, '');
  
  // Remove the country's dial code if it's at the beginning
  const dialCodeWithoutPlus = country.dialCode.replace('+', '');
  if (cleanNumber.startsWith(dialCodeWithoutPlus)) {
    cleanNumber = cleanNumber.substring(dialCodeWithoutPlus.length);
  }
  
  return `${country.dialCode}${cleanNumber}`;
};

export const parsePhoneInput = (input: string): { country?: Country; nationalNumber: string } => {
  if (!input) return { nationalNumber: '' };
  
  // If starts with +, try to find matching country
  if (input.startsWith('+')) {
    for (const country of countries) {
      if (input.startsWith(country.dialCode)) {
        const nationalNumber = input.substring(country.dialCode.length);
        return { country, nationalNumber };
      }
    }
  }
  
  return { nationalNumber: input };
};