const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: { name: 'ai' },
    async execute(interaction) {
        await interaction.deferReply();
        
        const perintah = interaction.options.getString('perintah');
        const groqApiKey = process.env.GROQ_API_KEY;

        if (!groqApiKey) {
            return interaction.editReply({ content: '❌ API Key Groq belum diatur di server.' });
        }

        try {
            // Memanggil API Groq
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: 'llama3-8b-8192',
                    messages: [
                        { role: 'user', content: perintah }
                    ],
                    max_tokens: 1024,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${groqApiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            let aiResponse = response.data.choices[0].message.content;

            // Jika respons kepanjangan untuk 1 pesan discord (max 2000 karakter), potong.
            if (aiResponse.length > 2000) {
                aiResponse = aiResponse.substring(0, 1997) + '...';
            }

            const embed = new EmbedBuilder()
                .setColor('#8B5CF6')
                .setAuthor({ name: 'Spark-Core AI', iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(`**Pertanyaan:**\n${perintah}\n\n**Jawaban:**\n${aiResponse}`)
                .setFooter({ text: 'Powered by Groq & Meta LLaMA' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error Groq AI:', error?.response?.data || error.message);
            
            // Fallback pesan error jika model tidak mendukung chat completion atau key invalid
            let errorMsg = '❌ Terjadi kesalahan saat memproses permintaan AI.';
            if (error?.response?.data?.error?.message) {
                errorMsg += `\nDetail: \`${error.response.data.error.message}\``;
            }
            
            await interaction.editReply({ content: errorMsg });
        }
    }
};
