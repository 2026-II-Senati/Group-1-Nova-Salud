"""
Genera los gráficos del informe del módulo de predicción (docs/ml/img).

Uso (desde cualquier carpeta):
    pip install matplotlib
    python ml/graficos_informe.py

Necesita ml/data/processed/dataset_nova_salud.csv (lo crea limpiar_dataset.py).
Las métricas de la comparación son las que imprime train.py y las de la tabla
del informe; si se reentrena el modelo hay que actualizarlas aquí.
"""
import os
import pandas as pd, numpy as np, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt, matplotlib.dates as mdates
from matplotlib.ticker import FuncFormatter
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'axes.titleweight':'bold','axes.titlesize':13,'figure.dpi':150})
T,TO,A,G,R='#0f766e','#115e59','#b45309','#64748b','#b91c1c'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RUTA_CSV = os.path.join(BASE_DIR, 'data', 'processed', 'dataset_nova_salud.csv')
RUTA_RAW = os.path.join(BASE_DIR, 'data', 'raw', 'rossmann.csv')
O = os.path.join(BASE_DIR, '..', 'docs', 'ml', 'img') + os.sep
os.makedirs(O, exist_ok=True)
mill=FuncFormatter(lambda v,_: f'{v/1e6:.0f} M')
df=pd.read_csv(RUTA_CSV,sep=';',parse_dates=['fecha'])
F=['ventas_ayer','ventas_hace_7_dias','promedio_7_dias','dia_semana','mes','dia_mes','Promo','SchoolHoliday']
n=len(df);a,b=int(n*.7),int(n*.85)
# 1 serie con tramos
fig,ax=plt.subplots(figsize=(11,4.6))
ax.plot(df.fecha,df.ventas_totales,color=T,lw=.6,alpha=.45,label='Venta diaria')
ax.plot(df.fecha,df.ventas_totales.rolling(7).mean(),color=TO,lw=2,label='Promedio de 7 días')
for (i,j,c,l) in [(0,a-1,'#ccfbf1','Entrenamiento (644 días)'),(a,b-1,'#fef3c7','Validación (138 días)'),(b,n-1,'#fee2e2','Prueba (139 días)')]:
    ax.axvspan(df.fecha[i],df.fecha[j],color=c,alpha=.8,zorder=0,label=l)
ax.yaxis.set_major_formatter(mill); ax.set_ylabel('Ventas agregadas (escala del archivo)')
ax.xaxis.set_major_formatter(mdates.DateFormatter('%m/%Y'))
ax.set_title('Ventas diarias agregadas de Rossmann y división cronológica 70/15/15')
ax.legend(ncol=5,loc='upper center',bbox_to_anchor=(.5,-.12),frameon=False,fontsize=9.5)
fig.tight_layout(); fig.savefig(O+'ml-serie-tramos.png'); plt.close()
# 2 dia semana
dn=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']; m=df.groupby('dia_semana').ventas_totales.mean()
fig,ax=plt.subplots(figsize=(8,4.2)); bars=ax.bar(dn,m.values,color=[T]*6+[A])
for bb,v in zip(bars,m.values): ax.text(bb.get_x()+bb.get_width()/2,v+1.5e5,f'{v/1e6:.2f} M'.replace('.',','),ha='center',fontsize=9.5)
ax.yaxis.set_major_formatter(mill); ax.set_ylabel('Venta media diaria')
ax.set_title('Venta media por día de la semana (921 días)'); fig.tight_layout(); fig.savefig(O+'ml-dia-semana.png'); plt.close()
# 3 tiendas por dia (necesita el archivo original, que no se sube al repositorio)
if os.path.exists(RUTA_RAW):
    # 3 tiendas por dia
    raw=pd.read_csv(RUTA_RAW,low_memory=False,usecols=['Store','Date','Open','Sales'])
    raw=raw[(raw.Open==1)&(raw.Sales>0)]; raw['Date']=pd.to_datetime(raw.Date)
    tc=raw.groupby('Date').Store.nunique(); tcw=tc[tc.index.day_of_week<6]
    fig,ax=plt.subplots(figsize=(11,3.8)); ax.plot(tcw.index,tcw.values,color=T,lw=1)
    ax.axvspan(pd.Timestamp('2014-07-01'),pd.Timestamp('2014-12-31'),color='#fef3c7',zorder=0,label='Jul–dic 2014: faltan registros de unas 180 tiendas')
    ax.set_ylabel('Tiendas abiertas con ventas'); ax.set_title('Tiendas con registros por día (lunes a sábado)')
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%m/%Y')); ax.legend(frameon=False,loc='lower left'); fig.tight_layout(); fig.savefig(O+'ml-tiendas-por-dia.png'); plt.close()
    
else:
    print('No se encontró data/raw/rossmann.csv: se omite ml-tiendas-por-dia.png')
# 4 metricas
met={'Naive\n(ventas de ayer)':(3236495.73,4914451.99,-1.1385),'Regresión\nLineal':(1442112.81,2137389.78,0.5955),'Random\nForest':(695674.66,1403588.78,0.8256)}
fig,(ax1,ax2)=plt.subplots(1,2,figsize=(11,4.4),gridspec_kw={'width_ratios':[1.6,1]})
x=np.arange(3); w=.38; names=list(met)
b1=ax1.bar(x-w/2,[met[k][0] for k in names],w,color=T,label='MAE'); b2=ax1.bar(x+w/2,[met[k][1] for k in names],w,color=A,label='RMSE')
for bb in list(b1)+list(b2): ax1.text(bb.get_x()+bb.get_width()/2,bb.get_height()+6e4,f'{bb.get_height()/1e6:.2f} M'.replace('.',','),ha='center',fontsize=9)
ax1.set_xticks(x,names); ax1.yaxis.set_major_formatter(mill); ax1.set_title('Error en prueba (menor es mejor)'); ax1.legend(frameon=False)
r2=[met[k][2] for k in names]; cols=[R if v<0 else (T if v==max(r2) else G) for v in r2]
bb=ax2.bar(x,r2,color=cols); ax2.axhline(0,color='#334155',lw=.8)
for b_,v in zip(bb,r2): ax2.text(b_.get_x()+b_.get_width()/2,v+(.05 if v>=0 else -.13),f'{v:.4f}'.replace('.',','),ha='center',fontsize=10,fontweight='bold')
ax2.set_xticks(x,names); ax2.set_ylim(-1.35,1.05); ax2.set_title('R² en prueba (mayor es mejor)')
fig.suptitle('Comparación de algoritmos en el tramo de prueba (01/03/2015 – 17/07/2015)',fontweight='bold'); fig.tight_layout(); fig.savefig(O+'ml-comparacion-metricas.png'); plt.close()
# 5 real vs pred
X,y=df[F],df.ventas_totales
rf=RandomForestRegressor(n_estimators=200,max_depth=None,random_state=42).fit(X[:b],y[:b]); p=rf.predict(X[b:])
fig,ax=plt.subplots(figsize=(11,4.4)); ax.plot(df.fecha[b:],y[b:],color=G,lw=1.4,label='Venta real')
ax.plot(df.fecha[b:],p,color=T,lw=1.6,ls='--',label='Estimación Random Forest')
ax.yaxis.set_major_formatter(mill); ax.xaxis.set_major_formatter(mdates.DateFormatter('%d/%m'))
ax.set_title('Venta real frente a la estimada en el tramo de prueba (139 días)'); ax.legend(frameon=False,loc='upper right'); ax.set_ylabel('Ventas agregadas')
fig.tight_layout(); fig.savefig(O+'ml-real-vs-estimado.png'); plt.close()
# 6 importancia
imp=pd.Series(rf.feature_importances_,index=F).sort_values()
fig,ax=plt.subplots(figsize=(8,4.4)); bb=ax.barh(imp.index,imp.values*100,color=[T if v==imp.max() else '#5eada5' for v in imp.values])
for b_,v in zip(bb,imp.values*100): ax.text(v+.8,b_.get_y()+b_.get_height()/2,f'{v:.1f} %'.replace('.',','),va='center',fontsize=9.5)
ax.set_xlabel('Importancia (%)'); ax.set_xlim(0,75); ax.set_title('Importancia de las variables del modelo final')
fig.tight_layout(); fig.savefig(O+'ml-importancia-variables.png'); plt.close()

# 7 diagrama del flujo del endpoint
from matplotlib.patches import FancyBboxPatch
R,G='#b91c1c','#334155'
T,A='#0f766e','#b45309'
fig,ax=plt.subplots(figsize=(13,6.6)); ax.set_xlim(0,13); ax.set_ylim(0,6.6); ax.axis('off')
def box(x,y,w,h,title,lines,c,fc):
    ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle='round,pad=0.04,rounding_size=0.15',fc=fc,ec=c,lw=2))
    ax.text(x+w/2,y+h-.3,title,ha='center',va='top',fontsize=12,fontweight='bold',color=c)
    ax.text(x+w/2,y+h-.8,'\n'.join(lines),ha='center',va='top',fontsize=9.3,color=G,linespacing=1.5)
y0,h=2.7,3.0
box(.2,y0,2.4,h,'React',['Pantalla Predicciones','(solo administrador)','Arma las 8 variables','Cabecera Authorization:','Bearer <token>'],T,'#f0fdfa')
box(3.8,y0,3.3,h,'Express',['POST /api/ml/prediccion','1. verifyToken: firma y','    vigencia del JWT','2. Rol: rol_id = 1','3. Validación de 8 campos','4. mlService (espera 8 s)'],T,'#f0fdfa')
box(8.3,y0,2.3,h,'FastAPI',['ml/api.py','POST /predecir','Pydantic valida tipos','Ordena las columnas'],A,'#fffbeb')
box(11.2,y0+.4,1.65,h-.8,'modelo.pkl',['Random Forest','200 árboles','se carga','una sola vez'],A,'#fffbeb')
def arr(x1,x2,y,t,up=True):
    ax.annotate('',xy=(x2,y),xytext=(x1,y),arrowprops=dict(arrowstyle='-|>',color=G,lw=1.8))
    ax.text((x1+x2)/2,y+(.15 if up else -.3),t,ha='center',fontsize=8.6,color=G)
arr(2.7,3.7,4.7,'JSON + JWT'); arr(3.7,2.7,3.5,'200 o error',False)
arr(7.2,8.2,4.7,'8 campos'); arr(8.2,7.2,3.5,'importe',False)
arr(10.7,11.1,4.2,'')
ax.text(6.5,6.35,'Flujo del endpoint de predicción de ventas',ha='center',fontsize=14,fontweight='bold',color=G)
ax.text(.2,2.05,'Respuestas de error de Express, con el formato { "message": "..." }',fontsize=10.5,fontweight='bold',color=R)
errs=[('401','Sin token, o token inválido o vencido'),('403','El usuario no es administrador'),('400','Falta un campo o un valor está fuera de rango'),('503','FastAPI apagado o sin respuesta en 8 s'),('502','FastAPI responde sin un importe válido')]
for i,(c,t) in enumerate(errs):
    x=.2+(i%3)*4.3; yy=1.45-(i//3)*.55
    ax.text(x,yy,c,fontsize=10.5,fontweight='bold',color=R); ax.text(x+.55,yy,t,fontsize=9,color=G)
fig.savefig(O+'ml-flujo-endpoint.png',bbox_inches='tight')
plt.close()
# 8 diagramas de la sección 7 (situación actual y sistema propuesto)
from matplotlib.patches import Polygon, Ellipse, Rectangle
plt.rcParams.update({'figure.dpi':200})
T,A,R,G='#0f766e','#b45309','#b91c1c','#334155'
def rbox(ax,x,y,w,h,t,ec=G,fc='white',tc=G,fs=10,r=.12,bold=False):
    ax.add_patch(FancyBboxPatch((x-w/2,y-h/2),w,h,boxstyle=f'round,pad=0.02,rounding_size={r}',fc=fc,ec=ec,lw=1.8))
    ax.text(x,y,t,ha='center',va='center',fontsize=fs,color=tc,fontweight='bold' if bold else 'normal',linespacing=1.35)
def term(ax,x,y,w,h,t,**k): rbox(ax,x,y,w,h,t,r=h/2-.03,**k)
def cyl(ax,x,y,w,h,t,ec=G,fc='white',tc=G,fs=10):
    e=h*.14
    ax.add_patch(Rectangle((x-w/2,y-h/2+e/2),w,h-e,fc=fc,ec='none'))
    ax.plot([x-w/2,x-w/2],[y-h/2+e/2,y+h/2-e/2],color=ec,lw=1.8); ax.plot([x+w/2,x+w/2],[y-h/2+e/2,y+h/2-e/2],color=ec,lw=1.8)
    ax.add_patch(Ellipse((x,y-h/2+e/2),w,e,fc=fc,ec=ec,lw=1.8))
    ax.add_patch(Rectangle((x-w/2+.02,y-h/2+e/2),w-.04,0.001,fc=fc,ec='none'))
    ax.add_patch(Ellipse((x,y+h/2-e/2),w,e,fc=fc,ec=ec,lw=1.8))
    ax.text(x,y-e*.25,t,ha='center',va='center',fontsize=fs,color=tc,linespacing=1.35)
def diamond(ax,x,y,w,h,t):
    ax.add_patch(Polygon([(x,y+h/2),(x+w/2,y),(x,y-h/2),(x-w/2,y)],fc='#f8fafc',ec=G,lw=1.8))
    ax.text(x,y,t,ha='center',va='center',fontsize=10,color=G,linespacing=1.35)
def arrow(ax,pts,c=G,ls='-',lw=1.6):
    for (x1,y1),(x2,y2) in zip(pts[:-2],pts[1:-1]): ax.plot([x1,x2],[y1,y2],color=c,lw=lw,ls=ls)
    ax.annotate('',xy=pts[-1],xytext=pts[-2],arrowprops=dict(arrowstyle='-|>',color=c,lw=lw,ls=ls,shrinkA=0,shrinkB=0))
def lab(ax,x,y,t,c=G,fs=9,bg='white',**k): ax.text(x,y,t,ha='center',va='center',fontsize=fs,color=c,bbox=dict(fc=bg,ec='none',pad=1.5),**k)

# ---------- Diagrama 1: situación actual (A4 vertical, ~16 x 15 cm) ----------
fig,ax=plt.subplots(figsize=(8,7.6)); ax.set_xlim(0,10); ax.set_ylim(0,9.5); ax.axis('off')
ax.text(5,9.2,'Situación actual: flujo de ventas e inventario en Nova Salud',ha='center',fontsize=13,fontweight='bold',color=G)
L,Rx=2.3,7.4; w=3.2
term(ax,L,8.3,w,.75,'Inicio de operación\nen Botica Nova Salud')
rbox(ax,L,6.85,w,.9,'Vendedor registra la venta\nen el sistema web')
cyl(ax,L,5.25,w,1.15,'Base de datos\nTiDB Cloud (MySQL)')
rbox(ax,L,3.65,w,.95,'Actualización automática\nde existencias\ny movimientos')
for y1,y2 in [(7.92,7.3),(6.4,5.83),(4.67,4.13)]: arrow(ax,[(L,y1),(L,y2)])
diamond(ax,Rx,8.0,3.9,1.6,'¿El producto\nalcanzó el\nstock mínimo?')
arrow(ax,[(L,3.17),(L,2.55),(4.85,2.55),(4.85,8.0),(Rx-1.95,8.0)])
rbox(ax,5.95+.05,6.05,2.2,1.0,'Sistema genera\nalerta de revisión\nde inventario',fs=9.5)
rbox(ax,8.85,6.05,2.0,1.0,'Stock en nivel\noperativo normal',fs=9.5)
arrow(ax,[(Rx-.6,7.48),(Rx-.6+ -0.8,7.48),(6.0,6.55)]) if False else None
arrow(ax,[(Rx,7.2),(Rx,6.9),(6.0,6.9),(6.0,6.55)]); lab(ax,Rx-.3,7.0,'Sí',fs=9.5,bg='#f1f5f9')
arrow(ax,[(Rx+1.95,8.0),(9.55,8.0),(9.55,6.55)]); lab(ax,9.55,7.3,'No',fs=9.5,bg='#f1f5f9')
rbox(ax,Rx,4.35,3.8,.95,'Administrador revisa historial\nde ventas e indicadores',fs=9.5)
arrow(ax,[(6.0,5.55),(6.0,5.1),(Rx-.3,5.1),(Rx-.3,4.83)]); arrow(ax,[(8.85,5.55),(8.85,5.1),(Rx+.3,5.1),(Rx+.3,4.83)])
rbox(ax,Rx,2.85,4.0,.95,'Análisis únicamente histórico:\nsin pronóstico de ventas futuras',ec=R,fc='#fee2e2',tc=R,bold=True,fs=9)
arrow(ax,[(Rx,3.87),(Rx,3.33)])
term(ax,Rx,1.5,2.6,.7,'Fin del proceso actual')
arrow(ax,[(Rx,2.37),(Rx,1.85)])
ax.text(5,.55,'La brecha (en rojo) es la que resuelve el módulo de pronóstico con Machine Learning.',ha='center',fontsize=9.5,color=G,style='italic')
fig.savefig(O+'diagrama-situacion-actual.png',bbox_inches='tight',facecolor='white'); plt.close()

# ---------- Diagrama 2: sistema propuesto (dos fases apiladas) ----------
fig,ax=plt.subplots(figsize=(10,7.4)); ax.set_xlim(0,12.5); ax.set_ylim(0,9.4); ax.axis('off')
ax.text(6.25,9.1,'Sistema propuesto: funcionamiento con el módulo de Machine Learning',ha='center',fontsize=13,fontweight='bold',color=G)
ax.add_patch(FancyBboxPatch((.15,5.55),12.2,3.1,boxstyle='round,pad=0.02,rounding_size=.2',fc='#fdf4ff',ec='#c084fc',lw=1.4))
ax.text(.4,8.38,'Fase 1: entrenamiento fuera de línea (Python)',fontsize=11,fontweight='bold',color='#7e22ce')
ax.add_patch(FancyBboxPatch((.15,.35),12.2,4.6,boxstyle='round,pad=0.02,rounding_size=.2',fc='#f0fdfa',ec='#5eead4',lw=1.4))
ax.text(.4,4.68,'Fase 2: consulta en línea (web y microservicio de ML)',fontsize=11,fontweight='bold',color=T)
y=6.85; xs=[1.35,3.75,6.2,8.65,11.1]; w=2.0
cyl(ax,xs[0],y,w,1.35,'rossmann.csv\n1 001 599\nregistros',fs=9)
rbox(ax,xs[1],y,w,1.2,'limpiar_dataset.py\nFiltra y crea\nlas 8 variables',fs=9)
cyl(ax,xs[2],y,w,1.35,'dataset_nova_\nsalud.csv\n921 días',fs=9)
rbox(ax,xs[3],y,w,1.2,'train.py\nRegresión Lineal\nvs Random Forest',fs=9)
cyl(ax,xs[4],y,w,1.35,'modelo.pkl\nRandom Forest\nR² = 0,8256',ec='#15803d',fc='#dcfce7',tc='#166534',fs=9)
for a,b in zip(xs[:-1],xs[1:]): arrow(ax,[(a+w/2+.03,y),(b-w/2-.05,y)])
# fase 2
y2=2.75; X=[1.2,4.05,7.6,11.15]; W=[1.9,2.1,2.5,2.1]
rbox(ax,X[0],y2,W[0],1.35,'Gráfico en\nRecharts:\nhistórico vs\nproyección',fs=8.8)
rbox(ax,X[1],y2,W[1],1.35,'Administrador\nen React\n(Predicciones)',ec=T,fs=9)
rbox(ax,X[2],y2,W[2],1.35,'Backend Node.js\nExpress\nPOST /api/ml/\nprediccion',ec=T,fs=9)
rbox(ax,X[3],y2,W[3],1.35,'Microservicio\nFastAPI\nPOST /predecir\n(api.py)',ec='#1d4ed8',fc='#eff6ff',tc='#1e3a8a',fs=9)
arrow(ax,[(X[3],y-.7),(X[3],y2+.7)],c='#475569',ls=':',lw=1.8); lab(ax,X[3],4.55,'Carga única al iniciar',fs=8.5,bg='#f0fdfa')
def flow(x1,x2,yy,txt,ty):
    arrow(ax,[(x1,yy),(x2,yy)],c=G)
    ax.text((x1+x2)/2,ty,txt,ha='center',va='center',fontsize=8.3,color=G,linespacing=1.3)
e=lambda k,side: X[k]+side*W[k]/2
flow(e(1,1)+.03,e(2,-1)-.05,y2+.3,'1. Solicita pronóstico\n+ token JWT',y2+1.15)
flow(e(2,1)+.03,e(3,-1)-.05,y2+.3,'2. Valida token y rol,\nreenvía por HTTP',y2+1.15)
flow(e(3,-1)-.03,e(2,1)+.05,y2-.3,'3. Retorna\nventas_estimadas',y2-1.15)
flow(e(2,-1)-.03,e(1,1)+.05,y2-.3,'4. JSON con importe\ny escenario',y2-1.15)
flow(e(1,-1)-.03,e(0,1)+.05,y2,'5. Muestra',y2+1.15)
ax.text(6.25,.75,'Si el token falta o es inválido: 401  ·  Si no es administrador: 403  ·  Datos inválidos: 400  ·  FastAPI caído: 503',ha='center',fontsize=8.6,color=R)
fig.savefig(O+'diagrama-sistema-propuesto-ml.png',bbox_inches='tight',facecolor='white'); plt.close()

print('Gráficos guardados en', os.path.abspath(O))
